import React, { useState } from 'react';
import Select from 'react-select';
let [selectedValue, setSelectedValue] = [null,null];
function SelectTw() {
  const data = [
    {
      value: 1,
      label: "Spanish"
    },
    {
      value: 2,
      label: "English"
    },
    {
      value: 3,
      label: "French"
    },
    {
      value: 4,
      label: "⠀"
    }
  ];
 
  // set value for default selection
  [selectedValue, setSelectedValue] = useState(4);
 
  // handle onChange event of the dropdown
  const handleChange = e => {
    setSelectedValue(e.value);
  }
 
  return (
    <div className="Select">
      
 
      <Select
        placeholder="Select Room"
        value={data.find(obj => obj.value === selectedValue)} // set selected value
        options={data} // set list of the data
        onChange={handleChange} // assign onChange functio

      />
 
      {selectedValue && <div style={{ marginTop: 20, lineHeight: '25px' }}>
        <div><b id="este">Selected Value: </b> {selectedValue}</div>
      </div>}
    </div>
  );
}
 
export default SelectTw;