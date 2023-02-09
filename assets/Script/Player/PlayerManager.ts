import { _decorator, Component, Animation, Sprite, UITransform, animation, AnimationClip, SpriteFrame } from 'cc'
import ResourceManager from '../../Runtime/ResourceManager'
import { TILE_HEIGHT, TILE_WIDTH } from '../Tile/TileManager'
const { ccclass, property } = _decorator

const ANIMATION_SPEED = 1 / 8

@ccclass('PlayerManager')
export class PlayerManager extends Component {
    async init() {
        const sprite = this.addComponent(Sprite)
        sprite.sizeMode = Sprite.SizeMode.CUSTOM
        const transform = this.getComponent(UITransform)
        transform.setContentSize(TILE_WIDTH * 4, TILE_HEIGHT * 4)

        const spriteFrames = await ResourceManager.Instance.loadDir('texture/player/idle/top')
        const animationComponent = this.addComponent(Animation)

        const animationClip = new AnimationClip()

        const track = new animation.ObjectTrack() // 创建一个对象轨道
        track.path = new animation.TrackPath().toComponent(Sprite).toProperty('spriteFrame')
        const frames: Array<[number, SpriteFrame]> = spriteFrames.map((item, index) => [ANIMATION_SPEED * index, item])
        // 添加关键帧
        track.channel.curve.assignSorted(frames)
        // 最后将轨道添加到动画剪辑以应用
        animationClip.addTrack(track)

        animationClip.duration = frames.length * ANIMATION_SPEED //整个动画剪辑的周期
        animationClip.wrapMode = AnimationClip.WrapMode.Loop
        animationComponent.defaultClip = animationClip
        animationComponent.play()
    }
}
