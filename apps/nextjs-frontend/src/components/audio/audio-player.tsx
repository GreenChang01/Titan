'use client';

import {
	useState, useRef, useEffect, type JSX,
} from 'react';
import {
	Play, Pause, Volume2, VolumeX, Download,
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Card, CardContent} from '@/components/ui/card';
import {Slider} from '@/components/ui/slider';
import {cn} from '@/lib/utils';

type AudioPlayerProps = {
	readonly src: string;
	readonly title?: string;
	readonly className?: string;
	readonly autoPlay?: boolean;
	readonly showDownload?: boolean;
};

export function AudioPlayer({
	src,
	title,
	className,
	autoPlay = false,
	showDownload = true,
}: AudioPlayerProps): JSX.Element {
	const audioRef = useRef<HTMLAudioElement>(null);
	const [isPlaying, setIsPlaying] = useState(false);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [volume, setVolume] = useState(1);
	const [isMuted, setIsMuted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | undefined>(null);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const setAudioData = () => {
			setDuration(audio.duration);
			setCurrentTime(audio.currentTime);
			setIsLoading(false);
		};

		const setAudioTime = () => {
			setCurrentTime(audio.currentTime);
		};

		const handleError = () => {
			setError('音频加载失败');
			setIsLoading(false);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
		};

		audio.addEventListener('loadeddata', setAudioData);
		audio.addEventListener('timeupdate', setAudioTime);
		audio.addEventListener('error', handleError);
		audio.addEventListener('ended', handleEnded);

		// Auto play if requested
		if (autoPlay) {
			audio
				.play()
				.then(() => {
					setIsPlaying(true);
				})
				.catch(() => {
					// Auto-play failed, likely due to browser policy
					setIsPlaying(false);
				});
		}

		return () => {
			audio.removeEventListener('loadeddata', setAudioData);
			audio.removeEventListener('timeupdate', setAudioTime);
			audio.removeEventListener('error', handleError);
			audio.removeEventListener('ended', handleEnded);
		};
	}, [src, autoPlay]);

	const togglePlayPause = () => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isPlaying) {
			audio.pause();
			setIsPlaying(false);
		} else {
			audio
				.play()
				.then(() => {
					setIsPlaying(true);
				})
				.catch(error_ => {
					setError('播放失败');
					console.error('Play failed:', error_);
				});
		}
	};

	const handleSeek = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const newTime = value[0];
		audio.currentTime = newTime;
		setCurrentTime(newTime);
	};

	const handleVolumeChange = (value: number[]) => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		const newVolume = value[0];
		audio.volume = newVolume;
		setVolume(newVolume);
		setIsMuted(newVolume === 0);
	};

	const toggleMute = () => {
		const audio = audioRef.current;
		if (!audio) {
			return;
		}

		if (isMuted) {
			audio.volume = volume;
			setIsMuted(false);
		} else {
			audio.volume = 0;
			setIsMuted(true);
		}
	};

	const formatTime = (time: number): string => {
		if (isNaN(time)) {
			return '0:00';
		}

		const minutes = Math.floor(time / 60);
		const seconds = Math.floor(time % 60);
		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	};

	const handleDownload = () => {
		const link = document.createElement('a');
		link.href = src;
		link.download = title || 'asmr-audio.mp3';
		document.body.append(link);
		link.click();
		link.remove();
	};

	if (error) {
		return (
			<Card className={cn('w-full', className)}>
				<CardContent className='p-4'>
					<div className='flex items-center justify-center text-destructive'>
						<span className='text-sm'>{error}</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className={cn('w-full', className)}>
			<CardContent className='p-4'>
				<div className='space-y-4'>
					{/* Title */}
					{title ? <div className='text-sm font-medium text-foreground'>{title}</div> : null}

					{/* Audio Element */}
					<audio ref={audioRef} src={src} preload='metadata' />

					{/* Controls */}
					<div className='flex items-center space-x-4'>
						{/* Play/Pause Button */}
						<Button disabled={isLoading} size='sm' className='h-10 w-10 p-0' onClick={togglePlayPause}>
							{isLoading
								? (
									<div className='h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent' />
								)
								: (isPlaying
									? (
										<Pause className='h-4 w-4' />
									)
									: (
										<Play className='h-4 w-4 ml-0.5' />
									))}
						</Button>

						{/* Progress Bar */}
						<div className='flex-1 space-y-1'>
							<Slider
								value={[currentTime]}
								max={duration || 100}
								min={0}
								step={1}
								className='w-full'
								disabled={isLoading || !duration}
								onValueChange={handleSeek}
							/>
							<div className='flex justify-between text-xs text-muted-foreground'>
								<span>{formatTime(currentTime)}</span>
								<span>{formatTime(duration)}</span>
							</div>
						</div>

						{/* Volume Control */}
						<div className='flex items-center space-x-2'>
							<Button variant='ghost' size='sm' className='h-8 w-8 p-0' onClick={toggleMute}>
								{isMuted || volume === 0 ? <VolumeX className='h-4 w-4' /> : <Volume2 className='h-4 w-4' />}
							</Button>
							<Slider
								value={[isMuted ? 0 : volume]}
								max={1}
								min={0}
								step={0.1}
								className='w-20'
								onValueChange={handleVolumeChange}
							/>
						</div>

						{/* Download Button */}
						{showDownload
							? <Button variant='ghost' size='sm' className='h-8 w-8 p-0' title='下载音频' onClick={handleDownload}>
								<Download className='h-4 w-4' />
							</Button>
							: null}
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
