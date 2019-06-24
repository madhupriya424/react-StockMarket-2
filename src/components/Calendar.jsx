
import React from "react";
import dateFns from "date-fns";
import { Modal, Button, Form } from 'react-bootstrap';
import "react-datepicker/dist/react-datepicker.css";
import {Api} from '../util/api.js'
import { Graph } from './Graph';
import Day from "./Day";


class Calendar extends React.Component {
  state = {
    currentMonth: new Date(),
    selectedDate: new Date(),
    prices : {},
    dialogStatus : false,
    currPrice : 0,
    deleteDialogStatus : false,
    ids : {},
    startDate : new Date(),
    endDate : new Date(),
    maxProfit : 0,
    chartData : {}
  };

  mapDateToPrice(arr) {
    let map = {};
    let mapId = {};
    for(let i = 0; i < arr.length; i++){
      let item = arr[i];
      map[item.fields.date] = item.fields.price;
      mapId[item.fields.date] = item.id;
    }
    this.setState({prices : map});
    this.setState({ids : mapId});
  }

  renderHeader() {
    const dateFormat = "MMMM YYYY";
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

  componentDidMount(){
    this.getData();
  }

  getData() {
    Api().get('/STOCK_PRICE?filterByFormula={month}='+ (this.state.currentMonth.getMonth() + 1) +'&api_key=keyyETxpFauOV7MdI')
    .then(res => {
       console.log('Stocks for this month are :', res.data.records);
       this.mapDateToPrice(res.data.records);
    }).catch(err => {
    });
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
  
    let  price = this.state.prices[day];
    console.log(price);
    if(price) {
      return (<div >
        <span className="price-display">Rs. {price}</span>
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
    console.log('Day clicked', day);
    if(day <= new Date()) {
      if(!this.state.dialogStatus && !this.state.prices[day.getDate()]) {
        this.setState({
          selectedDate : day,
          dialogStatus : !this.state.dialogStatus
        })
      }
      if(this.state.prices[day.getDate()] && !this.state.deleteDialogStatus) {
        this.setState({
          selectedDate : day,
          deleteDialogStatus : !this.state.deleteDialogStatus
        })
      }
    }
  };

  nextMonth = () => {
    this.setState({
      currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
    }, () => {
      this.getData();
    });
  };

  prevMonth = () => {
    this.setState({
      currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
    }, () => {
      this.getData();
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

    fields['timestamp'] = (new Date(fields.month + " " + fields.date + " " + fields.year).getTime()) + '';

   
    Api().post("/STOCK_PRICE",  {fields : fields})
       .then(res => {
        this.getData();
        this.setState({
          dialogStatus : !this.state.dialogStatus
        });
        <Graph findMaxProfit/>
        
      })
  }
  
  deletePrice = () => {
    let date = this.state.selectedDate.getDate();
    let id = this.state.ids[date];

    Api().delete("/STOCK_PRICE/" + id)
      .then(res => {
        this.getData();
        this.setState({
          deleteDialogStatus : !this.state.deleteDialogStatus
        });
        <Graph findMaxProfit/>
      });
  }


  render() {
    return (
      <div className="row">
      <div className="col-6">
        <div className="calendar">
        {this.renderHeader()}
        <Day currentMonth={this.state.currentMonth}></Day>
        {this.renderCells()}
      </div>
    </div>  

      
      <div className="col-6">
            <Graph />
        </div>
        
      </div>
    );
  }
}

export default Calendar;