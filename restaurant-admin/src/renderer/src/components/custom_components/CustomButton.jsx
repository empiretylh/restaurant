import react from 'react';

const CustomButton = ({ text, bgcolor = 'bg-primary', textcolor = 'text-white', icon , onClick}) => {
    return (
        <div onClick={onClick} className={`p-3 flex flex-row text-black border-gray-400 border rounded font-mono hover:bg-gray-500 itmes-center justify-center gap-1`}>
            {icon && <i className={icon}></i>}
            <h2 className='text-md font-bold'>{text}</h2>
        </div>
    )
}

export default CustomButton;