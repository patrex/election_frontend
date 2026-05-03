import { useState } from "react";
import moment from 'moment';

const ModalContainer = ({ children }) => {
    return <>
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {children}
            </div>
        </div>
    </>
}

export default ModalContainer;