import { ITile } from 'db://assets/Level'
import Singleton from '../Base/Singleton'

export default class DataManager extends Singleton {
    static get Instance() {
        return super.GetInstace<DataManager>()
    }
    mapInfo: Array<Array<ITile>>
    mapRowCount: number
    mapColumnCount: number
}
