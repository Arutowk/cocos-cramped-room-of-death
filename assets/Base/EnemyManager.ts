import { _decorator } from 'cc'
import { DIRECTION_ENUM, ENTITY_STATE_ENUM, EVENT_ENUM } from '../Enum'

import { IEntity } from '../Level'
import DataManager from '../Runtime/Datamanager'
import EventManager from '../Runtime/EventManager'
import { EntityManager } from './EntityManager'

const { ccclass } = _decorator

@ccclass('EnemyManager')
export class EnemyManager extends EntityManager {
    init(params: IEntity) {
        super.init(params)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection, this)
        EventManager.Instance.on(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection, this)
        EventManager.Instance.on(EVENT_ENUM.ATTACK_ENEMY, this.onDead, this)
        //保证无论敌人还是玩家先生成，敌人都能朝向玩家
        this.onChangeDirection(true)
    }

    onDestroy() {
        super.onDestroy()
        EventManager.Instance.off(EVENT_ENUM.PLAYER_BORN, this.onChangeDirection)
        EventManager.Instance.off(EVENT_ENUM.PLAYER_MOVE_END, this.onChangeDirection)
        EventManager.Instance.off(EVENT_ENUM.ATTACK_ENEMY, this.onDead)
    }

    onDead(id: string) {
        if (this.state === ENTITY_STATE_ENUM.DEATH) return
        if (id === this.id) this.state = ENTITY_STATE_ENUM.DEATH
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
