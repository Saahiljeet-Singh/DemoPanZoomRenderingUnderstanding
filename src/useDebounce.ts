import React from "react";

export function useDebounce(callbackFunc:any, delayInMs:any) {
    const [debounceValue, setDebounceValue] = React.useState(callbackFunc);
    React.useEffect(() => {
      const handler = setTimeout(() => {
        setDebounceValue(callbackFunc);
      }, delayInMs);
  
      return () => {
        clearTimeout(handler);
      };
    }, [callbackFunc, delayInMs]);
    return debounceValue;
  }
  