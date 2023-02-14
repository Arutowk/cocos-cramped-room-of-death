import { _decorator, Component, Node, director } from 'cc'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, SCENE_ENUM } from '../../Enum'
import levels, { ILevel } from '../../Level'
import DataManager, { IRecord } from '../../Runtime/Datamanager'
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
import { ShakeManager } from '../UI/ShakeManager'
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
        EventManager.Instance.on(EVENT_ENUM.RECORD_STEP, this.record, this)
        EventManager.Instance.on(EVENT_ENUM.REVOKE_STEP, this.revoke, this)
        EventManager.Instance.on(EVENT_ENUM.RESTART_LEVEL, this.initLevel, this)
        EventManager.Instance.on(EVENT_ENUM.QUIT_BATTLE, this.quitBattle, this)
    }

    onDestroy() {
        EventManager.Instance.off(EVENT_ENUM.NEXT_LEVEL, this.nextLevel)
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.checkArrived)
        EventManager.Instance.off(EVENT_ENUM.SHOW_SMOKE, this.generateSmoke)
        EventManager.Instance.off(EVENT_ENUM.RECORD_STEP, this.record)
        EventManager.Instance.off(EVENT_ENUM.REVOKE_STEP, this.revoke)
        EventManager.Instance.off(EVENT_ENUM.RESTART_LEVEL, this.initLevel)
        EventManager.Instance.off(EVENT_ENUM.QUIT_BATTLE, this.quitBattle)

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
        } else {
            this.quitBattle()
        }
    }

    nextLevel() {
        DataManager.Instance.levelIndex++
        this.initLevel()
    }

    async quitBattle() {
        await FaderManager.Instance.fadeIn()
        this.node.destroy()
        director.loadScene(SCENE_ENUM.Start)
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
        this.stage.addComponent(ShakeManager)
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
        this.stage.getComponent(ShakeManager).stop()
        this.stage.setPosition(-disX, disY)
    }

    record() {
        const item: IRecord = {
            player: {
                x: DataManager.Instance.player.targetX,
                y: DataManager.Instance.player.targetY,
                state:
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.IDLE ||
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.DEATH ||
                    DataManager.Instance.player.state === ENTITY_STATE_ENUM.AIRDEATH
                        ? DataManager.Instance.player.state
                        : ENTITY_STATE_ENUM.IDLE,
                direction: DataManager.Instance.player.direction,
                type: DataManager.Instance.player.type,
            },
            door: {
                x: DataManager.Instance.door.x,
                y: DataManager.Instance.door.y,
                state: DataManager.Instance.door.state,
                direction: DataManager.Instance.door.direction,
                type: DataManager.Instance.door.type,
            },
            enemies: DataManager.Instance.enemies.map(({ x, y, state, direction, type }) => {
                return {
                    x,
                    y,
                    state,
                    direction,
                    type,
                }
            }),
            spikes: DataManager.Instance.spikes.map(({ x, y, count, type }) => {
                return {
                    x,
                    y,
                    count,
                    type,
                }
            }),
            bursts: DataManager.Instance.bursts.map(({ x, y, state, direction, type }) => {
                return {
                    x,
                    y,
                    state,
                    direction,
                    type,
                }
            }),
        }
        DataManager.Instance.records.push(item)
    }

    revoke() {
        const data = DataManager.Instance.records.pop()
        if (data) {
            DataManager.Instance.player.x = DataManager.Instance.player.targetX = data.player.x
            DataManager.Instance.player.y = DataManager.Instance.player.targetY = data.player.y
            DataManager.Instance.player.state = data.player.state
            DataManager.Instance.player.direction = data.player.direction

            for (let i = 0; i < data.enemies.length; i++) {
                const item = data.enemies[i]
                DataManager.Instance.enemies[i].x = item.x
                DataManager.Instance.enemies[i].y = item.y
                DataManager.Instance.enemies[i].state = item.state
                DataManager.Instance.enemies[i].direction = item.direction
            }

            for (let i = 0; i < data.spikes.length; i++) {
                const item = data.spikes[i]
                DataManager.Instance.spikes[i].x = item.x
                DataManager.Instance.spikes[i].y = item.y
                DataManager.Instance.spikes[i].count = item.count
            }

            for (let i = 0; i < data.bursts.length; i++) {
                const item = data.bursts[i]
                DataManager.Instance.bursts[i].x = item.x
                DataManager.Instance.bursts[i].y = item.y
                DataManager.Instance.bursts[i].state = item.state
            }

            DataManager.Instance.door.x = data.door.x
            DataManager.Instance.door.y = data.door.y
            DataManager.Instance.door.state = data.door.state
            DataManager.Instance.door.direction = data.door.direction
        }
    }
}
