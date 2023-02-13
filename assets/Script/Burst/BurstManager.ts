import { UITransform, _decorator } from 'cc'
import { EntityManager } from '../../Base/EntityManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM, SHAKE_TYPE_ENUM } from '../../Enum'
import { IEntity } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
import { BurstStateMachine } from './BurstStateMachine'

const { ccclass } = _decorator

@ccclass('BurstManager')
export class BurstManager extends EntityManager {
    async init(params: IEntity) {
        this.fsm = this.addComponent(BurstStateMachine)
        await this.fsm.init()
        super.init(params)
        const transform = this.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH, TILE_HEIGHT)

        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst, this)
    }

    onDestroy() {
        super.onDestroy()
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onBurst)
    }

    update() {
        this.node.setPosition(this.x * TILE_WIDTH, -this.y * TILE_HEIGHT)
    }

    onBurst() {
        if (this.state === ENTITY_STATE_ENUM.DEATH) return

        const { targetX: playerX, targetY: playerY } = DataManager.Instance.player
        if (this.x === playerX && this.y === playerY && this.state === ENTITY_STATE_ENUM.IDLE) {
            this.state = ENTITY_STATE_ENUM.ATTACK
        } else if (this.state === ENTITY_STATE_ENUM.ATTACK) {
            this.state = ENTITY_STATE_ENUM.DEATH
            EventManager.Instance.emit(EVENT_ENUM.SCREEN_SHAKE, SHAKE_TYPE_ENUM.BOTTOM)
            //如果砖裂开的时候人在上面，玩家空中死亡
            if (this.x === playerX && this.y === playerY) {
                EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.AIRDEATH)
            }
        }
    }
}
