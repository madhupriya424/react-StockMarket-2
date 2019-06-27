import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import {Api} from "../util/api";


export class Graph extends React.Component {
  state = {
    startDate : new Date(),
    endDate : new Date(),
    maxProfit : 0,
    chartData : []
  };

  startDateSelection = (date) => {
    this.setState({
      startDate : date
    }, () => {
      this.findMaxProfit();
    });
  }

  endDateSelection = (date) => {
    this.setState({
      endDate : date
    }, () => {
      this.findMaxProfit();
    });
  }

  findMaxProfit = () => {
    let start = new Date(this.state.startDate.toLocaleDateString()).getTime();
    let end = new Date(this.state.endDate.toLocaleDateString()).getTime();
     
    
    Api().get('/STOCK_PRICE?filterByFormula=AND({timestamp}>=' +start + ', {timestamp}<=' + end + ')'+'&api_key=keyyETxpFauOV7MdI')
    .then(res => {
       let arr = res.data.records;
       arr.sort((item1, item2) => {
          return item1.fields.timestamp - item2.fields.timestamp;
       });

       let chartData = [];
       let months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
       arr.forEach((item) => {
          chartData.push({date : item.fields.date + '-' + months[item.fields.month - 1], price : item.fields.price});
       })
       this.setState({
         chartData : chartData
       })

       let minValue = 999999999;
       let ans=0;
       for(let i=0; i<arr.length;i++)
        {
            let p = parseInt(arr[i].fields.price);
            if(minValue > p)
              minValue = p;
              
            let temp = p - minValue;
            if(ans<temp)
            {
                ans = temp;
            }
        }

       this.setState({
         maxProfit : ans
       });
    }).catch(err => {
      
    });
  }

  renderDateSelection() {
    return (
      <div className="row">
        <div className="header row flex-middle">
            <div className="col col-center">
            <span className="profit">Buy / Sell Stock (One time)</span>
            <br/>
            <br/>
            <br/>
            </div>
          </div>
        <div className="col">
              <span><b>Start Date :  </b></span>
              <DatePicker
              selected={this.state.startDate}
              onChange={this.startDateSelection}
            />
          </div>
          <div className="col">
            <span><b>End Date :  </b></span>
          <DatePicker
              selected={this.state.endDate}
              onChange={this.endDateSelection}
            />
          </div>
          <div className="header row flex-middle">
            <div className="col col-center">
              <br />
              <br />

            <span className="profit">Max Profit : {this.state.maxProfit}</span>
            </div>
          </div>
        </div>
    );
  }

  renderChart = () => {
    return (
     <div>
        <LineChart
      width={500}
      height={300}
      data={this.state.chartData}
      margin={{
        top: 60, right: 15, left: 15, bottom: 5,
      }}
    >
      <CartesianGrid strokeDasharray="3 6" />
      <XAxis dataKey="date" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="price" stroke="#8884d8" activeDot={{ r: 4 }} />
    </LineChart>
       </div>
    );
  }

  render() {
      return (
        <div>
            <div className="row">
            {this.renderDateSelection()}
            </div>
            <div className="row">
                <br/>
                <br/>
                <br/>
                {this.renderChart()}
            </div>
        </div>
      )
  }
}

export default Graph;