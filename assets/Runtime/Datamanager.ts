import Singleton from '../Base/Singleton'
import { ITile } from '../Level'
import { TileManager } from '../Script/Tile/TileManager'

export default class DataManager extends Singleton {
    static get Instance() {
        return super.GetInstace<DataManager>()
    }
    mapInfo: Array<Array<ITile>>
    tileInfo: Array<Array<TileManager>>
    mapRowCount: number = 0
    mapColumnCount: number = 0
    levelIndex: number = 1

    reset() {
        this.mapInfo = []
        this.tileInfo = []
        this.mapRowCount = 0
        this.mapColumnCount = 0
    }
}
