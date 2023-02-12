import { _decorator } from 'cc'
import { EnemyManager } from '../../Base/EnemyManager'

import { EntityManager } from '../../Base/EntityManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import { IEntity } from '../../Level'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'

const { ccclass } = _decorator

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EnemyManager {
    async init(params: IEntity) {
        this.fsm = this.addComponent(WoodenSkeletonStateMachine)
        await this.fsm.init()
        super.init(params)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
    }

    onDestroy() {
        super.onDestroy()
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack)
    }

    onAttack() {
        if (this.state === ENTITY_STATE_ENUM.DEATH) return

        const { x: playerX, y: playerY, state: playerState } = DataManager.Instance.player
        if (
            //玩家在敌人周围4格时
            ((playerX === this.x && Math.abs(playerY - this.y) <= 1) ||
                (playerY === this.y && Math.abs(playerX - this.x) <= 1)) &&
            playerState !== ENTITY_STATE_ENUM.DEATH &&
            playerState !== ENTITY_STATE_ENUM.AIRDEATH
        ) {
            this.state = ENTITY_STATE_ENUM.ATTACK
            EventManager.Instance.emit(EVENT_ENUM.ATTACK_PLAYER, ENTITY_STATE_ENUM.DEATH)
        } else {
            this.state = ENTITY_STATE_ENUM.IDLE
        }
    }
}
