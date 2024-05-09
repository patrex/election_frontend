import AsyncSelect from 'react-select/async';

function Selector(props) {
	const filterOpts = (inputValue) => {
		return props.data.filter((i) =>
		  i.label.toLowerCase().includes(inputValue.toLowerCase())
		);
	      };
	      
	      const loadOptions = (inputValue, callback) => {
		setTimeout(() => {
		  callback(filterOpts(inputValue));
		}, 1000);
	      };
	return ( 
		<>
			<AsyncSelect cacheOptions loadOptions={loadOptions} defaultOptions />
		</>
	 );
}

export default Selector;