import type { KeyboardEvent, ReactNode } from 'react'
import { ACTION_KEY_HINTS, type GameboyAction } from './input'

interface GameboyChassisProps {
  powerOn: boolean
  onTogglePower: () => void
  onControl: (action: GameboyAction) => void
  /** The screen contents — the console never needs to know what a scene is. */
  children: ReactNode
}

/** The three stripes moulded into each D-pad arm. */
function DpadStripes() {
  return (
    <>
      <div className="button-stripe" />
      <div className="button-stripe" />
      <div className="button-stripe" />
    </>
  )
}

/**
 * The physical console: front plate, buttons, speaker, power slider.
 *
 * Markup and class names are the original ones — `gameboy.css` positions
 * everything in real pixels against a 660 × 1110 chassis. The only additions
 * are accessibility hooks: every control is a focusable `role="button"` with
 * a label that also names its keyboard shortcut.
 */
export default function GameboyChassis({
  powerOn,
  onTogglePower,
  onControl,
  children,
}: GameboyChassisProps) {
  const press = (action: GameboyAction) => () => onControl(action)

  const controlProps = (action: GameboyAction, label: string) => ({
    role: 'button' as const,
    tabIndex: 0,
    'aria-label': `${label} (${ACTION_KEY_HINTS[action]} on the keyboard)`,
    onClick: press(action),
    onKeyDown: (event: KeyboardEvent<HTMLElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      // Keep the window-level key handler from firing `start` on the same key.
      event.preventDefault()
      event.stopPropagation()
      onControl(action)
    },
  })

  return (
    <div className={`gameboy ${powerOn ? 'power-on' : ''}`}>
      <div className="front-plate">
        <div className="front-plate-head">
          <div className="vertical-stripe"></div>
          <div className="vertical-stripe"></div>
          <div className="vertical-stripe"></div>

          <div className="vertical-gouge vertical-gouge-1"></div>
          <div className="vertical-gouge vertical-gouge-2"></div>

          <div className="on-off">
            <div className="spike spike-left">
              <div></div>
            </div>
            <div className="spike spike-right">
              <div></div>
            </div>
            <span>
              OFF
              <i></i>
              ON
            </span>
          </div>
        </div>

        <div className="screen-container">
          <div className="screen-headline">
            <span>DOT MATRIX WITH STEREO SOUND</span>
          </div>

          <div className="battery-light">
            <span>BATTERY</span>
          </div>

          <div className="screen">{children}</div>
        </div>

        <div className="logo"></div>

        <div id="controller">
          <div className="buttons-a-b">
            <div
              className="button-b button-key-j"
              id="controller_b"
              {...controlProps('b', 'Tombol B')}
            ></div>

            <div
              className="button-a button-key-k"
              id="controller_a"
              {...controlProps('a', 'Tombol A')}
            ></div>
          </div>

          <div
            className="start button-key-m"
            id="controller_start"
            {...controlProps('start', 'Tombol start')}
          >
            <div></div>
          </div>

          <div
            className="select button-key-n"
            id="controller_select"
            {...controlProps('select', 'Tombol select')}
          >
            <div></div>
          </div>

          <div className="cross-container">
            <div className="spike">
              <div></div>
            </div>
            <div className="spike">
              <div></div>
            </div>
            <div className="spike">
              <div></div>
            </div>
            <div className="spike">
              <div></div>
            </div>

            <div className="cross" id="controller_dpad">
              <div className="top-down">
                <div
                  className="button-top button-key-w"
                  id="controller_up"
                  {...controlProps('up', 'Tombol atas')}
                >
                  <DpadStripes />
                </div>
                <div
                  className="button-bottom button-key-s"
                  id="controller_down"
                  {...controlProps('down', 'Tombol bawah')}
                >
                  <DpadStripes />
                </div>
              </div>

              <div className="left-right">
                <div
                  className="button-left button-key-a"
                  id="controller_left"
                  {...controlProps('left', 'Tombol kiri')}
                >
                  <DpadStripes />
                </div>
                <div
                  className="button-right button-key-d"
                  id="controller_right"
                  {...controlProps('right', 'Tombol kanan')}
                >
                  <DpadStripes />
                </div>
              </div>
              <div className="cross-middle-bumb"></div>
            </div>
          </div>
        </div>

        <div className="speaker">
          <div>
            <div className="speaker-inner-shadow"></div>
          </div>
          <div>
            <div className="speaker-inner-shadow"></div>
          </div>
          <div>
            <div className="speaker-inner-shadow"></div>
          </div>
          <div>
            <div className="speaker-inner-shadow"></div>
          </div>
          <div>
            <div className="speaker-inner-shadow"></div>
          </div>
          <div>
            <div className="speaker-inner-shadow"></div>
          </div>
        </div>

        <div className="phones" id="volume-switch">
          <div className="vertical-stripe"></div>
          <div className="vertical-stripe"></div>
          <div className="vertical-stripe"></div>
          <i></i>
          <span>PHONES</span>
        </div>
      </div>

      <div
        className="power-button"
        role="switch"
        aria-checked={powerOn}
        aria-label="Saklar power Game Boy"
        tabIndex={0}
        onClick={onTogglePower}
        onKeyDown={(event) => {
          if (event.key !== 'Enter' && event.key !== ' ') return
          event.preventDefault()
          event.stopPropagation()
          onTogglePower()
        }}
      >
        <div></div>
      </div>
    </div>
  )
}
