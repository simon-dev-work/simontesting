import { useEffect, useRef } from 'react';

export function useSafeEffect(callback, dependencies = []) {
  const isMounted = useRef(true);
  const dependenciesRef = useRef(dependencies);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (isMounted.current) {
      return callback();
    }
    // Using JSON.stringify for deep comparison of dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies.map(dep => JSON.stringify(dep)));
}

export default useSafeEffect;
 