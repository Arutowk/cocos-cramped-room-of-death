import { _decorator } from 'cc'
import { PlayerStateMachine } from './PlayerStateMachine'
import { TileManager } from '../Tile/TileManager'
import { EntityManager } from '../../Base/EntityManager'
import { CONTROLLER_ENUM, DIRECTION_ENUM, ENTITY_STATE_ENUM, ENTITY_TYPE_ENUM, EVENT_ENUM } from '../../Enum'
import EventManager from '../../Runtime/EventManager'
import DataManager from '../../Runtime/Datamanager'
import { WoodenSkeletonManager } from '../WoodenSkeleton/WoodenSkeletonManager'

const { ccclass } = _decorator

@ccclass('PlayerManager')
export class PlayerManager extends EntityManager {
    private readonly speed = 1 / 10
    targetX: number = 2
    targetY: number = 8
    isMoving = false

    async init() {
        this.fsm = this.addComponent(PlayerStateMachine)
        await this.fsm.init()
        //退出init方法后才执行状态变化
        super.init({
            x: 2,
            y: 8,
            type: ENTITY_TYPE_ENUM.PLAYER,
            direction: DIRECTION_ENUM.TOP,
            state: ENTITY_STATE_ENUM.IDLE,
        })
        this.state = ENTITY_STATE_ENUM.IDLE
        this.direction = DIRECTION_ENUM.TOP

        EventManager.Instance.on(EVENT_ENUM.PLAYER_CTRL, this.inputHandle, this)
        EventManager.Instance.on(EVENT_ENUM.ATTACK_PLAYER, this.onDead, this)
    }

    update() {
        super.update()
        this.updateXY()
    }

    updateXY() {
        //逼近targetX
        if (this.targetX < this.x) {
            this.x -= this.speed
        } else if (this.targetX > this.x) {
            this.x += this.speed
        }

        //逼近targetY
        if (this.targetY < this.y) {
            this.y -= this.speed
        } else if (this.targetY > this.y) {
            this.y += this.speed
        }

        //两者近似就触发结束
        if (Math.abs(this.targetX - this.x) < 0.01 && Math.abs(this.targetY - this.y) < 0.01 && this.isMoving) {
            this.x = this.targetX
            this.y = this.targetY
            this.isMoving = false
            EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
        }
    }

    onDead(type: ENTITY_STATE_ENUM) {
        this.state = type
    }

    inputHandle(inputDirection: CONTROLLER_ENUM) {
        if (this.isMoving) return
        if (
            this.state === ENTITY_STATE_ENUM.DEATH ||
            this.state === ENTITY_STATE_ENUM.AIRDEATH ||
            this.state === ENTITY_STATE_ENUM.ATTACK
        )
            return
        if (this.willAttack(inputDirection)) return
        if (this.willBlock(inputDirection)) return
        this.move(inputDirection)
    }

    move(inputDirection: CONTROLLER_ENUM) {
        if (inputDirection === CONTROLLER_ENUM.TOP) {
            this.targetY -= 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.BOTTOM) {
            this.targetY += 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.LEFT) {
            this.targetX -= 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.RIGHT) {
            this.targetX += 1
            this.isMoving = true
        } else if (inputDirection === CONTROLLER_ENUM.TURNLEFT) {
            if (this.direction === DIRECTION_ENUM.TOP) {
                this.direction = DIRECTION_ENUM.LEFT
            } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
                this.direction = DIRECTION_ENUM.RIGHT
            } else if (this.direction === DIRECTION_ENUM.LEFT) {
                this.direction = DIRECTION_ENUM.BOTTOM
            } else if (this.direction === DIRECTION_ENUM.RIGHT) {
                this.direction = DIRECTION_ENUM.TOP
            }
            EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
            this.state = ENTITY_STATE_ENUM.TURNLEFT
        } else if (inputDirection === CONTROLLER_ENUM.TURNRIGHT) {
            if (this.direction === DIRECTION_ENUM.TOP) {
                this.direction = DIRECTION_ENUM.RIGHT
            } else if (this.direction === DIRECTION_ENUM.BOTTOM) {
                this.direction = DIRECTION_ENUM.LEFT
            } else if (this.direction === DIRECTION_ENUM.LEFT) {
                this.direction = DIRECTION_ENUM.TOP
            } else if (this.direction === DIRECTION_ENUM.RIGHT) {
                this.direction = DIRECTION_ENUM.BOTTOM
            }
            EventManager.Instance.emit(EVENT_ENUM.PLAYER_MOVE_END)
            this.state = ENTITY_STATE_ENUM.TURNRIGHT
        }
    }

    //判断将要攻击
    willAttack(inputDirection: CONTROLLER_ENUM): boolean {
        const enemies = DataManager.Instance.enemies.filter(
            (enemy: WoodenSkeletonManager) => enemy.state !== ENTITY_STATE_ENUM.DEATH,
        )
        for (let i = 0; i < enemies.length; i++) {
            const { x: enemyX, y: enemyY } = enemies[i]
            if (
                inputDirection === CONTROLLER_ENUM.TOP &&
                this.direction === DIRECTION_ENUM.TOP &&
                enemyY === this.targetY - 2 &&
                enemyX === this.x
            ) {
                this.state = ENTITY_STATE_ENUM.ATTACK
                return true
            } else if (
                inputDirection === CONTROLLER_ENUM.BOTTOM &&
                this.direction === DIRECTION_ENUM.BOTTOM &&
                enemyY === this.targetY + 2 &&
                enemyX === this.x
            ) {
                this.state = ENTITY_STATE_ENUM.ATTACK
                return true
            } else if (
                inputDirection === CONTROLLER_ENUM.LEFT &&
                this.direction === DIRECTION_ENUM.LEFT &&
                enemyX === this.targetX - 2 &&
                enemyY === this.y
            ) {
                this.state = ENTITY_STATE_ENUM.ATTACK
                return true
            } else if (
                inputDirection === CONTROLLER_ENUM.RIGHT &&
                this.direction === DIRECTION_ENUM.RIGHT &&
                enemyX === this.targetX + 2 &&
                enemyY === this.y
            ) {
                this.state = ENTITY_STATE_ENUM.ATTACK
                return true
            }
        }
        return false
    }

    //判断是否碰撞
    willBlock(inputDirection: CONTROLLER_ENUM): boolean {
        const { targetX: x, targetY: y, direction } = this
        const { tileInfo } = DataManager.Instance
        let nowWeaPonX: number, nowWeaponY: number
        switch (direction) {
            case DIRECTION_ENUM.TOP:
                nowWeaPonX = x
                nowWeaponY = y - 1
                break
            case DIRECTION_ENUM.BOTTOM:
                nowWeaPonX = x
                nowWeaponY = y + 1
                break
            case DIRECTION_ENUM.LEFT:
                nowWeaPonX = x - 1
                nowWeaponY = y
                break
            case DIRECTION_ENUM.RIGHT:
                nowWeaPonX = x + 1
                nowWeaponY = y
                break
            default:
                break
        }
        //操作后玩家假设在的位置和枪扫过的若干位置
        let nextPlayerTile: TileManager | null,
            nextWeaponTile: Array<TileManager | null> = []
        switch (inputDirection) {
            case CONTROLLER_ENUM.TOP:
                nextPlayerTile = tileInfo?.[x]?.[y - 1] ?? null
                nextWeaponTile = [tileInfo?.[nowWeaPonX]?.[nowWeaponY - 1] ?? null]
                break
            case CONTROLLER_ENUM.BOTTOM:
                nextPlayerTile = tileInfo?.[x]?.[y + 1] ?? null
                nextWeaponTile = [tileInfo?.[nowWeaPonX]?.[nowWeaponY + 1] ?? null]
                break
            case CONTROLLER_ENUM.LEFT:
                nextPlayerTile = tileInfo?.[x - 1]?.[y] ?? null
                nextWeaponTile = [tileInfo?.[nowWeaPonX - 1]?.[nowWeaponY] ?? null]
                break
            case CONTROLLER_ENUM.RIGHT:
                nextPlayerTile = tileInfo?.[x + 1]?.[y] ?? null
                nextWeaponTile = [tileInfo?.[nowWeaPonX + 1]?.[nowWeaponY] ?? null]
                break
            case CONTROLLER_ENUM.TURNLEFT:
                nextPlayerTile = tileInfo?.[x]?.[y] ?? null
                if (direction === DIRECTION_ENUM.TOP) {
                    nextWeaponTile = [tileInfo?.[x - 1]?.[y - 1] ?? null, tileInfo?.[x - 1]?.[y] ?? null]
                } else if (direction === DIRECTION_ENUM.BOTTOM) {
                    nextWeaponTile = [tileInfo?.[x + 1]?.[y + 1] ?? null, tileInfo?.[x + 1]?.[y] ?? null]
                } else if (direction === DIRECTION_ENUM.LEFT) {
                    nextWeaponTile = [tileInfo?.[x - 1]?.[y + 1] ?? null, tileInfo?.[x]?.[y + 1] ?? null]
                } else if (direction === DIRECTION_ENUM.RIGHT) {
                    nextWeaponTile = [tileInfo?.[x + 1]?.[y - 1] ?? null, tileInfo?.[x]?.[y - 1] ?? null]
                }
                break
            case CONTROLLER_ENUM.TURNRIGHT:
                nextPlayerTile = tileInfo?.[x]?.[y] ?? null
                if (direction === DIRECTION_ENUM.TOP) {
                    nextWeaponTile = [tileInfo?.[x + 1]?.[y - 1] ?? null, tileInfo?.[x + 1]?.[y] ?? null]
                } else if (direction === DIRECTION_ENUM.BOTTOM) {
                    nextWeaponTile = [tileInfo?.[x - 1]?.[y + 1] ?? null, tileInfo?.[x - 1]?.[y] ?? null]
                } else if (direction === DIRECTION_ENUM.LEFT) {
                    nextWeaponTile = [tileInfo?.[x - 1]?.[y - 1] ?? null, tileInfo?.[x]?.[y - 1] ?? null]
                } else if (direction === DIRECTION_ENUM.RIGHT) {
                    nextWeaponTile = [tileInfo?.[x + 1]?.[y + 1] ?? null, tileInfo?.[x]?.[y + 1] ?? null]
                }
                break
            default:
                break
        }
        if (
            nextPlayerTile === null ||
            nextPlayerTile?.moveable === false ||
            nextWeaponTile.some(tile => tile?.turnable === false)
        ) {
            switch (inputDirection) {
                case CONTROLLER_ENUM.TOP:
                    this.state = ENTITY_STATE_ENUM.BLOCKFRONT
                    break
                case CONTROLLER_ENUM.BOTTOM:
                    this.state = ENTITY_STATE_ENUM.BLOCKBACK
                    break
                case CONTROLLER_ENUM.LEFT:
                    this.state = ENTITY_STATE_ENUM.BLOCKLEFT
                    break
                case CONTROLLER_ENUM.RIGHT:
                    this.state = ENTITY_STATE_ENUM.BLOCKRIGHT
                    break
                case CONTROLLER_ENUM.TURNLEFT:
                    this.state = ENTITY_STATE_ENUM.BLOCKTURNLEFT
                    break
                case CONTROLLER_ENUM.TURNRIGHT:
                    this.state = ENTITY_STATE_ENUM.BLOCKTURNRIGHT
                    break
                default:
                    break
            }
            return true
        }
        return false
    }
}
