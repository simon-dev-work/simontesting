import React from 'react';
import { Pulsar } from 'ldrs/react'
import 'ldrs/react/Pulsar.css'


const Loader = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">          
      
        <Pulsar
          size="40"
          speed="1.75"
          color="black" 
        />
      </div>
    </div>
  );
};

export default Loader;






