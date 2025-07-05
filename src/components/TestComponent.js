import React from 'react';

const TestComponent = () => {
  console.log('TestComponent is rendering');
  return (
    <div className="alert alert-success m-3">
      <h4>Test Component</h4>
      <p>If you can see this, React is rendering correctly.</p>
    </div>
  );
};

export default TestComponent;
