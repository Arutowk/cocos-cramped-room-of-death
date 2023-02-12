/***
 * 地图瓦片枚举
 */
export enum TILE_TYPE_ENUM {
    WALL_ROW = 'WALL_ROW',
    WALL_COLUMN = 'WALL_COLUMN',
    WALL_LEFT_TOP = 'WALL_LEFT_TOP',
    WALL_RIGHT_TOP = 'WALL_RIGHT_TOP',
    WALL_LEFT_BOTTOM = 'WALL_LEFT_BOTTOM',
    WALL_RIGHT_BOTTOM = 'WALL_RIGHT_BOTTOM',
    CLIFF_LEFT = 'CLIFF_ROW_START',
    CLIFF_CENTER = 'CLIFF_ROW_CENTER',
    CLIFF_RIGHT = 'CLIFF_ROW_END',
    FLOOR = 'FLOOR',
}

/***
 * 事件枚举
 */
export enum EVENT_ENUM {
    NEXT_LEVEL = 'NEXT_LEVEL',
    /**  移动转向操作 */
    PLAYER_CTRL = 'PLAYER_CTRL',
    /** 玩家完成移动 */
    PLAYER_MOVE_END = 'PLAYER_MOVE_END',
    /** 玩家出生 */
    PLAYER_BORN = 'PLAYER_BORN',
    /** 玩家被攻击*/
    ATTACK_PLAYER = 'ATTACK_PLAYER',
    /** 玩家攻击敌人*/
    ATTACK_ENEMY = 'ATTACK_ENEMY',
    /** 打开下一关的门*/
    DOOR_OPEN = 'DOOR_OPEN',
}

/***
 * 活动单位枚举
 */
export enum ENTITY_TYPE_ENUM {
    PLAYER = 'PLAYER',
    SKELETON_WOODEN = 'SKELETON_WOODEN',
    SKELETON_IRON = 'SKELETON_IRON',
    SPIKES_ONE = 'SPIKES_ONE',
    SPIKES_TWO = 'SPIKES_TWO',
    SPIKES_THREE = 'SPIKES_THREE',
    SPIKES_FOUR = 'SPIKES_FOUR',
    BURST = 'BURST',
    DOOR = 'DOOR',
    SMOKE = 'SMOKE',
}

/***
 * 角色方向枚举
 */
export enum DIRECTION_ENUM {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    TOP = 'TOP',
    BOTTOM = 'BOTTOM',
}

/***
 * 方向顺序
 */
export enum DIRECTION_ORDER_ENUM {
    TOP = 0,
    BOTTOM = 1,
    LEFT = 2,
    RIGHT = 3,
}

/***
 * 控制按钮枚举
 */
export enum CONTROLLER_ENUM {
    LEFT = 'LEFT',
    RIGHT = 'RIGHT',
    TOP = 'TOP',
    BOTTOM = 'BOTTOM',
    TURNLEFT = 'TURNLEFT',
    TURNRIGHT = 'TURNRIGHT',
}

/***
 * 角色状态枚举
 */
export enum ENTITY_STATE_ENUM {
    IDLE = 'IDLE',
    ATTACK = 'ATTACK',
    TURNLEFT = 'TURNLEFT',
    TURNRIGHT = 'TURNRIGHT',
    BLOCKFRONT = 'BLOCKFRONT',
    BLOCKBACK = 'BLOCKBACK',
    BLOCKLEFT = 'BLOCKLEFT',
    BLOCKRIGHT = 'BLOCKRIGHT',
    BLOCKTURNLEFT = 'BLOCKTURNLEFT',
    BLOCKTURNRIGHT = 'BLOCKTURNRIGHT',
    DEATH = 'DEATH',
    AIRDEATH = 'AIRDEATH',
}

/***
 * 有限状态机参数类型枚举
 */
export enum FSM_PARAM_TYPE_ENUM {
    NUMBER = 'NUMBER',
    TRIGGER = 'TRIGGER',
}

/***
 * trigger参数列表名称
 */
export enum PARAMS_NAME_ENUM {
    IDLE = 'IDLE',
    ATTACK = 'ATTACK',
    TURNLEFT = 'TURNLEFT',
    TURNRIGHT = 'TURNRIGHT',
    BLOCKFRONT = 'BLOCKFRONT',
    BLOCKBACK = 'BLOCKBACK',
    BLOCKLEFT = 'BLOCKLEFT',
    BLOCKRIGHT = 'BLOCKRIGHT',
    BLOCKTURNLEFT = 'BLOCKTURNLEFT',
    BLOCKTURNRIGHT = 'BLOCKTURNRIGHT',
    DEATH = 'DEATH',
    AIRDEATH = 'AIRDEATH',
    DIRECTION = 'DIRECTION',
    SPIKES_TOTAL_COUNT = 'SPIKES_TOTAL_COUNT',
    SPIKES_CUR_COUNT = 'SPIKES_CUR_COUNT',
}

/***
 * 尖刺类型和总点数映射
 */
export enum SPIKES_TYPE_MAP_TOTAL_COUNT_ENUM {
    SPIKES_ONE = 2,
    SPIKES_TWO = 3,
    SPIKES_THREE = 4,
    SPIKES_FOUR = 5,
}

/***
 * 尖刺当前点数枚举
 */
export enum SPIKES_COUNT_ENUM {
    ZERO = 'ZERO',
    ONE = 'ONE',
    TWO = 'TWO',
    THREE = 'THREE',
    FOUR = 'FOUR',
    FIVE = 'FIVE',
}

/***
 * 尖刺点数类型和数字映射
 */
export enum SPIKES_COUNT_MAP_NUMBER_ENUM {
    ZERO = 0,
    ONE = 1,
    TWO = 2,
    THREE = 3,
    FOUR = 4,
    FIVE = 5,
}
