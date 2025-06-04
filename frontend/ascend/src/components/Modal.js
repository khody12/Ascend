import React from 'react';

function Modal({ isOpen, onClose, title, children, onConfirm, confirmText = "Confirm", cancelText = "Cancel" }) {
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white text-2xl"
                        aria-label="Close modal"
                    >
                        ×
                    </button>
                </div>
                <div className="text-gray-300 mb-6">
                    {children}
                </div>
                <div className="flex justify-end space-x-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-md transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={() => {
                            if (onConfirm) onConfirm();
                            onClose(); // Close modal after confirm
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Modal;