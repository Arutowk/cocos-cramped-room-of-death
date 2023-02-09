import { ITile } from 'db://assets/Level'

class DataManager {
    mapInfo: Array<Array<ITile>>
    mapRowCount: number
    mapColumnCount: number
}
export const DataManagerInstance = new DataManager()
