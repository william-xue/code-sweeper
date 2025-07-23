// Test file for code sweeper functionality

import { useState, useEffect } from 'react';
function TestComponent() {
  const [count, setCount] = useState(0);

  // This should be removed

  useEffect(() => {
    setCount(1);
  }, []);
  const handleClick = () => {
    setCount(count + 1);
  };
  return <div>
      <h1>Count: {count}</h1>
      <button onClick={handleClick}>Increment</button>
    </div>;
}
export default TestComponent;