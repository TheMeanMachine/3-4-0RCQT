//__mocks__/game.js

export const mockGetGameByTitle = jest.fn()
const mock = jest.fn().mockImplementation(() =>{
    return {getGameByTitle: mockGetGameByTitle}
})

export default mock