import React, {Component} from 'react';

class DataTable extends Component {


render() {
    const {data} = this.props;

    return (
      <div className="base-panel data-table">
                <table className="table">
          <caption>
            Climate data from 1960 onward, showing CO<sub>2</sub> emissions,
            concentrations, and temperatures.
          </caption>

          <thead>
            <tr>
              <th scope="col">Year</th>
              <th scope="col">CO2 Conc. (ppm)</th>
              <th scope="col">CO2 Emiss. (GtC)</th>
              <th scope="col">Temp &deg;C</th>
              <th scope="col">Temp &deg;F</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, i) => (
              <tr key={i}>
                <th scope="row">{item.year.getFullYear()}</th>
                <td>{parseFloat(item.co2Concentration).toFixed(3)}</td>
                <td>{item.co2Emissions}</td>
                <td>{parseFloat(item.tempC).toFixed(3)}</td>
                <td>{parseFloat(item.tempF).toFixed(3)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
}


}

export default DataTable;