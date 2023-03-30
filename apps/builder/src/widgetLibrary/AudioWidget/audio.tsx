import { FC, forwardRef, useCallback, useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import ReactPlayer from "react-player"
import { Loading, isNumber } from "@illa-design/react"
import {
  audioWrapperStyle,
  fullStyle,
  loadingStyle,
} from "@/widgetLibrary/AudioWidget/style"
import { TooltipWrapper } from "@/widgetLibrary/PublicSector/TooltipWrapper"
import { AudioWidgetProps, WrappedAudioProps } from "./interface"

export const WrappedAudio = forwardRef<ReactPlayer, WrappedAudioProps>(
  (props, ref) => {
    const {
      url,
      playing,
      autoPlay,
      controls = true,
      loop,
      volume,
      muted,
      playbackRate,
      onPlay,
      onReady,
      onPause,
      onEnded,
      onPlaybackRateChange,
    } = props
    const { t } = useTranslation()
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    if (url === "") {
      return <div css={loadingStyle}>{t("widget.audio.no_audio")}</div>
    }

    return (
      <>
        {loading ? (
          <div css={loadingStyle}>
            <Loading colorScheme="black" />
          </div>
        ) : null}
        <ReactPlayer
          css={audioWrapperStyle}
          style={loading ? { display: "none" } : undefined}
          config={{
            file: {
              forceAudio: true,
            },
          }}
          ref={ref}
          width="100%"
          height="100%"
          url={url}
          volume={volume}
          muted={muted}
          controls={controls}
          playbackRate={playbackRate}
          loop={loop}
          playing={autoPlay || playing}
          draggable={false}
          onReady={(player) => {
            setLoading(false)
            setError(false)
            onReady()
          }}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onError={() => {
            setLoading(false)
            setError(true)
          }}
          onPlaybackRateChange={onPlaybackRateChange}
        />
      </>
    )
  },
)

WrappedAudio.displayName = "WrappedAudio"

export const AudioWidget: FC<AudioWidgetProps> = (props) => {
  const {
    handleUpdateOriginalDSLMultiAttr,
    handleUpdateMultiExecutionResult,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
    displayName,
    tooltipText,
    triggerEventHandler,
    controls,
    muted,
  } = props

  const audioRef = useRef<ReactPlayer>(null)

  useEffect(() => {
    handleUpdateGlobalData(displayName, {
      play: () => {
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { playing: true },
          },
        ])
      },
      pause: () => {
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { playing: false },
          },
        ])
      },
      setAudioUrl: (url: string) => {
        handleUpdateOriginalDSLMultiAttr({ url })
      },
      seekTo: (time: number, type: "seconds" | "fraction" = "seconds") => {
        audioRef.current?.seekTo(time, type)
      },
      mute: (value: boolean) => {
        const audio = audioRef.current?.getInternalPlayer() as HTMLAudioElement
        if (audio) {
          // As the player doesn't update internally, it's necessary to modify the DOM directly.
          audio.muted = value
        }
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { muted: value },
          },
        ])
      },
      setLoop: (value: boolean) => {
        const audio = audioRef.current?.getInternalPlayer() as HTMLAudioElement
        if (audio) {
          // As the player doesn't update internally, it's necessary to modify the DOM directly.
          audio.loop = value
        }
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { loop: value },
          },
        ])
      },
      setSpeed: (value: number) => {
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { playbackRate: value },
          },
        ])
      },
      setVolume: (value: number) => {
        const audio = audioRef.current?.getInternalPlayer() as HTMLAudioElement
        if (audio) {
          // As the player doesn't update internally, it's necessary to modify the DOM directly.
          audio.volume = value
        }
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { volume: value },
          },
        ])
      },
    })
    return () => {
      handleDeleteGlobalData(displayName)
    }
  }, [
    displayName,
    handleUpdateGlobalData,
    handleDeleteGlobalData,
    handleUpdateMultiExecutionResult,
    handleUpdateOriginalDSLMultiAttr,
  ])

  const onPlay = useCallback(() => {
    handleUpdateMultiExecutionResult([
      {
        displayName,
        value: { playing: true },
      },
    ])
    triggerEventHandler("play")
  }, [displayName, triggerEventHandler, handleUpdateMultiExecutionResult])

  const onPause = useCallback(() => {
    handleUpdateMultiExecutionResult([
      {
        displayName,
        value: { playing: false },
      },
    ])
    triggerEventHandler("pause")
  }, [displayName, triggerEventHandler, handleUpdateMultiExecutionResult])

  const onReady = useCallback(() => {
    triggerEventHandler("loaded")
  }, [triggerEventHandler])

  const onEnded = useCallback(() => {
    triggerEventHandler("ended")
  }, [triggerEventHandler])

  const onPlaybackRateChange = useCallback(
    (playbackRate: number) => {
      if (isNumber(playbackRate)) {
        handleUpdateMultiExecutionResult([
          {
            displayName,
            value: { playbackRate },
          },
        ])
      }
    },
    [displayName, handleUpdateMultiExecutionResult],
  )

  return (
    <TooltipWrapper tooltipText={tooltipText} tooltipDisabled={!tooltipText}>
      <div css={fullStyle}>
        <WrappedAudio
          {...props}
          ref={audioRef}
          onReady={onReady}
          onPlay={onPlay}
          onPause={onPause}
          onEnded={onEnded}
          onPlaybackRateChange={onPlaybackRateChange}
        />
      </div>
    </TooltipWrapper>
  )
}

AudioWidget.displayName = "AudioWidget"
