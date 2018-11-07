import Http from './http'

export const create = data => Http.post('/week', data)

export const findOne = data => Http.get('/week/'+ data)
