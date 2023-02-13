import { _decorator, Component, Node } from 'cc'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import levels, { ILevel } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import FaderManager from '../../Runtime/FaderManager'
import { createUINode } from '../../Util'
import { BurstManager } from '../Burst/BurstManager'
import { DoorManager } from '../Door/DoorManager'
import { IronSkeletonManager } from '../IronSkeleton/IronSkeletonManager'
import { PlayerManager } from '../Player/PlayerManager'
import { SmokeManager } from '../Smoke/SmokeManager'
import { SpikesManager } from '../Spikes/SpikesManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { TileMapManager } from '../Tile/TileMapManager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'

const { ccclass } = _decorator

@ccclass('BattleManager')
export class BattleManager extends Component {
    level: ILevel
    stage: Node

    private smokeLayer: Node
    private hasInited = false //第一次从菜单进来的时候，入场fade效果不一样，特殊处理一下

    onLoad() {
        DataManager.Instance.levelIndex = 1
        EventManager.Instance.on(EVENT_ENUM.NEXT_LEVEL, this.nextLevel, this)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived, this)
        EventManager.Instance.on(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke, this)
    }

    onDestroy() {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived)
        EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke)

        EventManager.Instance.clear()
    }

    start() {
        this.generateStage()
        this.initLevel()
    }

    async initLevel() {
        const level = levels[`level${DataManager.Instance.levelIndex}`]
        if (level) {
            if (this.hasInited) {
                await FaderManager.Instance.fadeIn()
            } else {
                await FaderManager.Instance.mask()
            }

            this.clearLevel()

            // 储存关卡等级
            this.level = level

            // 储存地图信息
            DataManager.Instance.mapInfo = this.level.mapInfo
            DataManager.Instance.mapRowCount = this.level.mapInfo.length || 0
            DataManager.Instance.mapColumnCount = this.level.mapInfo[0]?.length || 0

            await Promise.all([
                // 生成地图
                this.generateTileMap(),
                this.generateSmokeLayer(),
                //生成敌人
                this.generateEnemies(),
                //生成门
                this.generateDoor(),
                //生成砖片
                this.generateBurst(),
                //生成地刺
                this.generateSpikes(),
            ])
            // 生成玩家
            await this.generatePlayer()
            await FaderManager.Instance.fadeOut()
            this.hasInited = true
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
        tileMap.setParent(this.stage)
        const tileManager = tileMap.addComponent(TileMapManager)
        await tileManager.init()
        this.adaptPos()
    }

    async generatePlayer() {
        const player = createUINode()
        player.setParent(this.stage)
        const playerManager = player.addComponent(PlayerManager)
        await playerManager.init(this.level.player)
        DataManager.Instance.player = playerManager
        EventManager.Instance.emit(EVENT_ENUM.PLAYER_BORN)
    }

    async generateEnemies() {
        const promise = []
        for (let i = 0; i < this.level.enemies.length; i++) {
            const enemy = this.level.enemies[i]
            const node = createUINode()
            node.setParent(this.stage)
            const Manager =
                enemy.type === ENTITY_TYPE_ENUM.SKELETON_WOODEN ? WoodenSkeletonManager : IronSkeletonManager
            const manager = node.addComponent(Manager)
            promise.push(manager.init(enemy))
            DataManager.Instance.enemies.push(manager)
        }
        await Promise.all(promise)
    }

    async generateDoor() {
        const door = createUINode()
        door.setParent(this.stage)
        const doorManager = door.addComponent(DoorManager)
        await doorManager.init(this.level.door)
        DataManager.Instance.door = doorManager
    }

    async generateBurst() {
        const promise = []
        for (let i = 0; i < this.level.bursts.length; i++) {
            const burst = this.level.bursts[i]
            const node = createUINode()
            node.setParent(this.stage)
            const burstManager = node.addComponent(BurstManager)
            promise.push(burstManager.init(burst))
            DataManager.Instance.bursts.push(burstManager)
        }
        await Promise.all(promise)
    }

    async generateSpikes() {
        const promise = []
        for (let i = 0; i < this.level.spikes.length; i++) {
            const spikes = this.level.spikes[i]
            const node = createUINode()
            node.setParent(this.stage)
            const spikesManager = node.addComponent(SpikesManager)
            promise.push(spikesManager.init(spikes))
            DataManager.Instance.spikes.push(spikesManager)
        }
        await Promise.all(promise)
    }

    //引入缓存池，避免重新生成大量烟雾实例
    async generateSmoke(x: number, y: number, direction: DIRECTION_ENUM) {
        const item = DataManager.Instance.smokes.find(smoke => smoke.state === ENTITY_STATE_ENUM.DEATH)
        if (item) {
            //已经生成烟雾的话改变位置和变成出生状态
            item.x = x
            item.y = y
            item.direction = direction
            item.node.setPosition(x * TILE_WIDTH - 1.5 * TILE_WIDTH, 1.5 * TILE_HEIGHT - y * TILE_HEIGHT)
            item.state = ENTITY_STATE_ENUM.IDLE
        } else {
            const smoke = createUINode()
            smoke.setParent(this.smokeLayer)
            const smokeManager = smoke.addComponent(SmokeManager)
            await smokeManager.init({ x, y, direction, state: ENTITY_STATE_ENUM.IDLE, type: ENTITY_TYPE_ENUM.SMOKE })
            DataManager.Instance.smokes.push(smokeManager)
        }
    }

    //让人的UI盖住Smoke的UI
    async generateSmokeLayer() {
        this.smokeLayer = createUINode()
        this.smokeLayer.setParent(this.stage)
    }

    checkArrived() {
        if (!DataManager.Instance.door || !DataManager.Instance.player) return
        const { x: playerX, y: playerY } = DataManager.Instance.player
        const { x: doorX, y: doorY, state: doorState } = DataManager.Instance.door
        if (playerX === doorX && playerY === doorY && doorState === ENTITY_STATE_ENUM.DEATH) {
            EventManager.Instance.emit(EVENT_ENUM.NEXT_LEVEL)
        }
    }

    //自适应调整地图位于屏幕中央
    adaptPos() {
        const { mapColumnCount, mapRowCount } = DataManager.Instance
        const disX = (TILE_WIDTH * mapRowCount) / 2
        const disY = (TILE_HEIGHT * mapColumnCount) / 2 + 80
        this.stage.setPosition(-disX, disY)
    }
}
