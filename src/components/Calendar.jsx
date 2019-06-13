import React from "react";
import dateFns from "date-fns";
import { Modal, Button, Form } from 'react-bootstrap';
import axios from 'axios';


class Calendar extends React.Component {
  state = {
    currentMonth: new Date(),
    selectedDate: new Date(),
    prices : {},
    dialogStatus : false,
    currPrice : 0,
    deleteDialogStatus : false
  };

  mapDateToPrice(arr) {
    let map = {};
    for(let i = 0; i < arr.length; i++){
      let item = arr[i];
      map[item.fields.date] = item.fields.price;
    }
    this.setState({prices : map});
    //console.log(this.state);
  }

  componentDidMount(){
    this.fetchApi();
  }

  fetchApi() {
    fetch('https://api.airtable.com/v0/appGudhHSPRS9Mg91/STOCK_PRICE?filterByFormula={month}='+ (this.state.currentMonth.getMonth() + 1) +'&api_key=keyyETxpFauOV7MdI')
    .then((resp) => resp.json())
    .then(data => {
      // this.setState({prices : data.records});
       console.log(data.records);
       this.mapDateToPrice(data.records);
       console.log(this.state.prices);
    }).catch(err => {
      // Error 🙁
    });
  }

  

  renderHeader() {
    const dateFormat = "MMMM YYYY";
   // console.log(dateFns.format(this.state.currentMonth, dateFormat));
   // debugger;
    return (
      <div className="header row flex-middle">
        <div className="col col-start">
          <div className="icon" onClick={this.prevMonth}>
            chevron_left
          </div>
        </div>
        <div className="col col-center">
          <span>{dateFns.format(this.state.currentMonth, dateFormat)}</span>
        </div>
        <div className="col col-end" onClick={this.nextMonth}>
          <div className="icon">chevron_right</div>
        </div>
      </div>
    );
  }

  renderDays() {
    const dateFormat = "dddd";
    const days = [];

    let startDate = dateFns.startOfWeek(this.state.currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {dateFns.format(dateFns.addDays(startDate, i), dateFormat)}
        </div>
      );
    }
    return <div className="days row">{days}</div>;
  }

  renderCells() {
    const { currentMonth, selectedDate } = this.state;
    const monthStart = dateFns.startOfMonth(currentMonth);
    const monthEnd = dateFns.endOfMonth(monthStart);
    const startDate = dateFns.startOfWeek(monthStart);
    const endDate = dateFns.endOfWeek(monthEnd);

    const dateFormat = "D";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

   // console.log(day);

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = dateFns.format(day, dateFormat);
        const cloneDay = day;
        days.push(
          <div
            className={`col cell ${
              !dateFns.isSameMonth(day, monthStart)
                ? "disabled"
                : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
            }`}
            key={day}
            onClick={() => this.onDateClick(dateFns.parse(cloneDay))}
          >
            {this.renderPrice(day.getDate(), day.getMonth())}
            {/* <span className="price-display">{this.state.prices[day.getDate()]}</span> */}
            <span className="number">{formattedDate}</span>
            <span className="bg">{formattedDate}</span>
          </div>
        );
        day = dateFns.addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  }

  renderPrice(day, month) {
    let currDate = new Date().getDate();
    let currMonth = new Date().getMonth();
    let selectedDate = this.state.currentMonth.toDateString();
    if(month > currMonth ) {
      return;
    }
    else if(month == currMonth) {
      if(day > currDate) {
        return;
      }
    }
    // debugger;
    // let price;
    // if(this.state.price)
    let  price = this.state.prices[day]
    if(price) {
      return (<div >
        <span className="price-display">{price}</span>
        <Modal show={this.state.deleteDialogStatus} onHide={this.handleDeleteClose}>
          <Modal.Header closeButton>
            <Modal.Title>Date : {this.state.selectedDate.toDateString()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
           <p>Current Price :<b> {this.state.prices[this.state.selectedDate.getDate()]} </b></p>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleDeleteClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.deletePrice}>
              Delete Price
            </Button>
          </Modal.Footer>
        </Modal>
      </div>)
    }
    else {
      return (<div>
        <Modal show={this.state.dialogStatus} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Date : {this.state.selectedDate.toDateString()}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
          <Form>
            <Form.Group controlId="formBasicEmail">
              <Form.Label>Enter Price</Form.Label>
              <br/>
              <input value={this.state.currPrice} onChange={evt => this.updateInputValue(evt)}/>
            </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={this.handleClose}>
              Close
            </Button>
            <Button variant="primary" onClick={this.submitPrice}>
              Submit
            </Button>
          </Modal.Footer>
        </Modal>
        </div>)
    }
  }

  onDateClick = day => {
    // this.setState({
    //   selectedDate: day
    // });
    console.log(day)
    if(day <= new Date()) {
      if(!this.state.dialogStatus && !this.state.prices[day.getDate()]) {
        this.setState({
          selectedDate : day,
          dialogStatus : !this.state.dialogStatus
        })
      }
      if(this.state.prices[day.getDate()] && !this.state.deleteDialogStatus) {
        console.log("coming")
        this.setState({
          selectedDate : day,
          deleteDialogStatus : !this.state.deleteDialogStatus
        })
      }
    }
    console.log("date clicked");
  };

  nextMonth = () => {
    this.setState({
      currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
    }, () => {
      this.fetchApi();
    });
  };

  prevMonth = () => {
    this.setState({
      currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
    }, () => {
      this.fetchApi();
    });
  };

  handleClose = () => {
    this.setState({
      dialogStatus : false
    })
  }

  handleDeleteClose = () => {
    this.setState({
      deleteDialogStatus : false
    })
  }

  updateInputValue(evt) {
    this.setState({
      currPrice: evt.target.value
    });
  }

  submitPrice = () => {
    console.log("submiting price", this.state.currPrice, "for", this.state.selectedDate);
    
    let fields = {
      "price" : this.state.currPrice,
      "date" : this.state.selectedDate.getDate() + '',
      "month" : (this.state.selectedDate.getMonth() + 1) +'',
      "year" : (this.state.selectedDate.getFullYear() + '')
    }

    axios.defaults.headers = {
      "Content-Type": 'application/json',
      "Authorization" : 'Bearer ' + 'keyyETxpFauOV7MdI'
      }

    axios.post("https://api.airtable.com/v0/appGudhHSPRS9Mg91/STOCK_PRICE", {fields : fields})
      .then(res => {
        console.log(res);
        this.fetchApi();
        this.setState({
  
          dialogStatus : !this.state.dialogStatus
        })
      })
  }
  
  deletePrice = () => {
    
  }

  render() {
    return (
      <div className="calendar">
        {this.renderHeader()}
        {this.renderDays()}
        {this.renderCells()}
      </div>
    );
  }
}

export default Calendar;