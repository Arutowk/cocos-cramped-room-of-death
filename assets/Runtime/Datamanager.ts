import Singleton from '../Base/Singleton'
import { ITile } from '../Level'
import { DoorManager } from '../Script/Door/DoorManager'
import { PlayerManager } from '../Script/Player/PlayerManager'
import { TileManager } from '../Script/Tile/TileManager'
import { WoodenSkeletonManager } from '../Script/WoodenSkeleton/WoodenSkeletonManager'

export default class DataManager extends Singleton {
    static get Instance() {
        return super.GetInstace<DataManager>()
    }
    mapInfo: Array<Array<ITile>>
    tileInfo: Array<Array<TileManager>>
    mapRowCount: number = 0
    mapColumnCount: number = 0
    levelIndex: number = 1
    player: PlayerManager
    enemies: WoodenSkeletonManager[]
    door: DoorManager

    reset() {
        this.mapInfo = []
        this.tileInfo = []
        this.mapRowCount = 0
        this.mapColumnCount = 0
        this.player = null
        this.enemies = []
        this.door = null
    }
}
