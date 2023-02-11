import { _decorator } from 'cc'

import { EntityManager } from '../../Base/EntityManager'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import DataManager from '../../Runtime/Datamanager'
import EventManager from '../../Runtime/EventManager'
import { WoodenSkeletonStateMachine } from './WoodenSkeletonStateMachine'

const { ccclass } = _decorator

@ccclass('WoodenSkeletonManager')
export class WoodenSkeletonManager extends EntityManager {
    async init() {
        this.fsm = this.addComponent(WoodenSkeletonStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init({
            x: 2,
            y: 4,
            type: ENTITY_TYPE_ENUM.SKELETON_WOODEN,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onAttack, this)
        //保证无论敌人还是玩家先生成，敌人都能朝向玩家
        this.onChangeDirection(true)
    }

    onAttack() {
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

    /***
     * 根据玩家在敌人的象限改变敌人的朝向
     */
    onChangeDirection(init = false) {
        if (this.state === ENTITY_STATE_ENUM.DEATH || !DataManager.Instance.player) {
            return
        }
        const { x: playerX, y: playerY } = DataManager.Instance.player
        const disX = Math.abs(playerX - this.x)
        const disY = Math.abs(playerY - this.y)

        //确保敌人在初始化的时候调整一次direction
        if (disX === disY && !init) {
            return
        }

        //第一象限
        if (playerX >= this.x && playerY <= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.TOP

            //第二象限
        } else if (playerX <= this.x && playerY <= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.LEFT : DIRECTION_ENUM.TOP

            //第三象限
        } else if (playerX <= this.x && playerY >= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.LEFT : DIRECTION_ENUM.BOTTOM

            //第四象限
        } else if (playerX >= this.x && playerY >= this.y) {
            this.direction = disX >= disY ? DIRECTION_ENUM.RIGHT : DIRECTION_ENUM.BOTTOM
        }
    }
}
