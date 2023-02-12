import { _decorator, Component, Node } from 'cc'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import levels, { ILevel } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { createUINode } from '../../Util'
import { BurstManager } from '../Burst/BurstManager'
import { DoorManager } from '../Door/DoorManager'
import { IronSkeletonManager } from '../IronSkeleton/IronSkeletonManager'
import { PlayerManager } from '../Player/PlayerManager'
import { SpikesManager } from '../Spikes/SpikesManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { TileMapManager } from '../Tile/TileMapManager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'

const { ccclass } = _decorator

@ccclass('BattleManager')
export class BattleManager extends Component {
    level: ILevel
    stage: Node

    onLoad() {
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
    }

    onDestroy() {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
    }

    start() {
        this.generateStage()
        this.initLevel()
    }

    initLevel() {
        const level = levels[`level${DataManager.Instance.levelIndex}`]
        if (level) {
            this.clearLevel()

            // 储存关卡等级
            this.level = level

            // 储存地图信息
            DataManager.Instance.mapInfo = this.level.mapInfo
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0].length || 0

            // 生成地图
            this.generateTileMap()
            //生成敌人
            // this.generateEnemies()
            //生成门
            this.generateDoor()
            //生成砖片
            // this.generateBurst()
            //生成地刺
            this.generateSpikes()
            // 生成玩家
            this.generatePlayer()
        }
    }

    nextLevel() {
        DataManager.Instance.levelIndex++
        this.initLevel()
    }

    clearLevel() {
        //消除上一关的所有游戏对象
        this.stage.destroyAllChildren()
        //数据中心重置
        DataManager.Instance.reset()
    }
    generateStage() {
        //创建舞台
        this.stage = createUINode()
        this.stage.setParent(this.node)
    }

    async generateTileMap() {
        //创建瓦片地图
        const tileMap = createUINode()
        await tileMap.setParent(this.stage)

        const tileManager = tileMap.addComponent(TileMapManager)
        tileManager.init()

        this.adaptPos()
    }

    async generatePlayer() {
        const player = createUINode()
        player.setParent(this.stage)
        const playerManager = player.addComponent(PlayerManager)
        await playerManager.init({
            x: 2,
            y: 8,
            type: ENTITY_TYPE_ENUM.PLAYER,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        DataManager.Instance.player = playerManager
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN)
    }

    async generateEnemies() {
        const enemy1 = createUINode()
        enemy1.setParent(this.stage)
        const woodenSkeletonManager = enemy1.addComponent(WoodenSkeletonManager)
        await woodenSkeletonManager.init({
            x: 2,
            y: 4,
            type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        DataManager.Instance.enemies.push(woodenSkeletonManager)

        const enemy2 = createUINode()
        enemy2.setParent(this.stage)
        const ironSkeletonManager = enemy2.addComponent(IronSkeletonManager)
        await ironSkeletonManager.init({
            x: 2,
            y: 2,
            type: ENTITY_TYPE_ENUM.SKELETON_IRON,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        DataManager.Instance.enemies.push(ironSkeletonManager)
    }

    async generateDoor() {
        const door = createUINode()
        door.setParent(this.stage)
        const doorManager = door.addComponent(DoorManager)
        await doorManager.init({
            x: 7,
            y: 8,
            type: ENTITY_TYPE_ENUM.DOOR,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        DataManager.Instance.door = doorManager
    }

    async generateBurst() {
        const burst = createUINode()
        burst.setParent(this.stage)
        const burstManager = burst.addComponent(BurstManager)
        await burstManager.init({
            x: 2,
            y: 6,
            type: ENTITY_TYPE_ENUM.BURST,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        DataManager.Instance.bursts.push(burstManager)
    }

    async generateSpikes() {
        const spikes = createUINode()
        spikes.setParent(this.stage)
        const spikesManager = spikes.addComponent(SpikesManager)
        await spikesManager.init({
            x: 2,
            y: 6,
            type: ENTITY_TYPE_ENUM.SPIKES_FOUR,
            count: 0,
        })
        DataManager.Instance.spikes.push(spikesManager)
    }

    //自适应调整地图位于屏幕中央
    adaptPos() {
        const { mapColumnCount, mapRowCount } = DataManager.Instance
        const disX = (TILE_WIDTH * mapRowCount) / 2
        const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
        this.stage.setPosition(-disX, disY)
    }
}
