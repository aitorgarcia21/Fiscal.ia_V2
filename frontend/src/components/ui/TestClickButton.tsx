import React from 'react';

export function TestClickButton() {
  const handleClick = () => {
    console.log('🚨 TEST BUTTON CLICKED!');
    alert('TEST BUTTON WORKS!');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '10px',
        right: '10px',
        zIndex: 999999,
        backgroundColor: 'red',
        color: 'white',
        padding: '10px',
        border: 'none',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '16px',
        fontWeight: 'bold'
      }}
      onClick={handleClick}
      onMouseDown={() => console.log('🖱️ TEST MOUSE DOWN')}
      onMouseUp={() => console.log('🖱️ TEST MOUSE UP')}
    >
      TEST CLICK
    </div>
  );
}
