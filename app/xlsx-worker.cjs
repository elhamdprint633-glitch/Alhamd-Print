'use strict';
const {parentPort,workerData}=require('node:worker_threads');
const {makeXLSX}=require('./xlsx-service.cjs');
try{const bytes=Uint8Array.from(makeXLSX(workerData));parentPort.postMessage(bytes,[bytes.buffer]);}catch(e){throw e;}
