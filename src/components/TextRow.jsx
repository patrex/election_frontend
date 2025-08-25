import './text_row.css'

function TextRow(text_heading, text_value) {
	return ( <>
		<div className="text_row_box">
			<h3>{text_heading}</h3>
			<p>{text_value}</p>
		</div>
	</> );
}

export default TextRow;