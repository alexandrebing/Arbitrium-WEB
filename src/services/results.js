import Http from './http'

export const get = id => Http.get('/result/interview/'+id)

export const getCalc = id => Http.get('/result/'+id);