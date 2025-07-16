import {
	FileIcon,
	ImageIcon,
	VideoIcon,
	AudioWaveform,
	FileTextIcon,
	FileArchive,
	Code,
	FileSpreadsheet,
	Presentation,
} from 'lucide-react';

// File type definitions
export interface FileType {
	icon: React.ComponentType<{className?: string}>;
	color: string;
	category: 'image' | 'video' | 'audio' | 'document' | 'archive' | 'code' | 'other';
}

// File extension to type mapping
const fileTypeMap: Record<string, FileType> = {
	// Images
	jpg: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	jpeg: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	png: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	gif: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	webp: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	svg: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	bmp: {icon: ImageIcon, color: 'text-green-500', category: 'image'},
	
	// Videos
	mp4: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	avi: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	mov: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	wmv: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	flv: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	webm: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	mkv: {icon: VideoIcon, color: 'text-red-500', category: 'video'},
	
	// Audio
	mp3: {icon: AudioWaveform, color: 'text-purple-500', category: 'audio'},
	wav: {icon: AudioWaveform, color: 'text-purple-500', category: 'audio'},
	flac: {icon: AudioWaveform, color: 'text-purple-500', category: 'audio'},
	aac: {icon: AudioWaveform, color: 'text-purple-500', category: 'audio'},
	ogg: {icon: AudioWaveform, color: 'text-purple-500', category: 'audio'},
	m4a: {icon: AudioWaveform, color: 'text-purple-500', category: 'audio'},
	
	// Documents
	pdf: {icon: FileTextIcon, color: 'text-red-600', category: 'document'},
	doc: {icon: FileTextIcon, color: 'text-blue-600', category: 'document'},
	docx: {icon: FileTextIcon, color: 'text-blue-600', category: 'document'},
	txt: {icon: FileTextIcon, color: 'text-gray-600', category: 'document'},
	md: {icon: FileTextIcon, color: 'text-gray-600', category: 'document'},
	rtf: {icon: FileTextIcon, color: 'text-blue-600', category: 'document'},
	
	// Spreadsheets
	xls: {icon: FileSpreadsheet, color: 'text-green-600', category: 'document'},
	xlsx: {icon: FileSpreadsheet, color: 'text-green-600', category: 'document'},
	csv: {icon: FileSpreadsheet, color: 'text-green-600', category: 'document'},
	
	// Presentations
	ppt: {icon: Presentation, color: 'text-orange-600', category: 'document'},
	pptx: {icon: Presentation, color: 'text-orange-600', category: 'document'},
	
	// Archives
	zip: {icon: FileArchive, color: 'text-yellow-600', category: 'archive'},
	rar: {icon: FileArchive, color: 'text-yellow-600', category: 'archive'},
	'7z': {icon: FileArchive, color: 'text-yellow-600', category: 'archive'},
	tar: {icon: FileArchive, color: 'text-yellow-600', category: 'archive'},
	gz: {icon: FileArchive, color: 'text-yellow-600', category: 'archive'},
	
	// Code
	js: {icon: Code, color: 'text-yellow-500', category: 'code'},
	ts: {icon: Code, color: 'text-blue-500', category: 'code'},
	jsx: {icon: Code, color: 'text-cyan-500', category: 'code'},
	tsx: {icon: Code, color: 'text-cyan-500', category: 'code'},
	html: {icon: Code, color: 'text-orange-500', category: 'code'},
	css: {icon: Code, color: 'text-blue-500', category: 'code'},
	scss: {icon: Code, color: 'text-pink-500', category: 'code'},
	json: {icon: Code, color: 'text-gray-500', category: 'code'},
	xml: {icon: Code, color: 'text-gray-500', category: 'code'},
	py: {icon: Code, color: 'text-yellow-500', category: 'code'},
	java: {icon: Code, color: 'text-red-500', category: 'code'},
	cpp: {icon: Code, color: 'text-blue-500', category: 'code'},
	c: {icon: Code, color: 'text-blue-500', category: 'code'},
	php: {icon: Code, color: 'text-purple-500', category: 'code'},
	rb: {icon: Code, color: 'text-red-500', category: 'code'},
	go: {icon: Code, color: 'text-blue-500', category: 'code'},
	rs: {icon: Code, color: 'text-orange-500', category: 'code'},
	swift: {icon: Code, color: 'text-orange-500', category: 'code'},
	kt: {icon: Code, color: 'text-purple-500', category: 'code'},
	dart: {icon: Code, color: 'text-blue-500', category: 'code'},
};

/**
 * Get the file type icon component for a given filename
 */
export function getFileTypeIcon(filename: string): React.ComponentType<{className?: string}> {
	const extension = filename.split('.').pop()?.toLowerCase();
	return fileTypeMap[extension || '']?.icon || FileIcon;
}

/**
 * Get the file type color for a given filename
 */
export function getFileTypeColor(filename: string): string {
	const extension = filename.split('.').pop()?.toLowerCase();
	return fileTypeMap[extension || '']?.color || 'text-gray-500';
}

/**
 * Get the file category for a given filename
 */
export function getFileCategory(filename: string): string {
	const extension = filename.split('.').pop()?.toLowerCase();
	return fileTypeMap[extension || '']?.category || 'other';
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
	if (bytes === 0) return '0 Bytes';
	
	const k = 1024;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	
	return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
	return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Check if file is an image
 */
export function isImageFile(filename: string): boolean {
	const extension = getFileExtension(filename);
	return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension);
}

/**
 * Check if file is a video
 */
export function isVideoFile(filename: string): boolean {
	const extension = getFileExtension(filename);
	return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm', 'mkv'].includes(extension);
}

/**
 * Check if file is an audio file
 */
export function isAudioFile(filename: string): boolean {
	const extension = getFileExtension(filename);
	return ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(extension);
}

/**
 * Check if file is a document
 */
export function isDocumentFile(filename: string): boolean {
	const extension = getFileExtension(filename);
	return ['pdf', 'doc', 'docx', 'txt', 'md', 'rtf', 'xls', 'xlsx', 'csv', 'ppt', 'pptx'].includes(extension);
}

/**
 * Check if file is an archive
 */
export function isArchiveFile(filename: string): boolean {
	const extension = getFileExtension(filename);
	return ['zip', 'rar', '7z', 'tar', 'gz'].includes(extension);
}

/**
 * Check if file is a code file
 */
export function isCodeFile(filename: string): boolean {
	const extension = getFileExtension(filename);
	return ['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'scss', 'json', 'xml', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs', 'swift', 'kt', 'dart'].includes(extension);
}

/**
 * Format date for file display
 */
export function formatFileDate(date: string | Date): string {
	const fileDate = new Date(date);
	const now = new Date();
	const diffTime = Math.abs(now.getTime() - fileDate.getTime());
	const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
	
	if (diffDays === 1) {
		return 'Yesterday';
	} else if (diffDays < 7) {
		return `${diffDays} days ago`;
	} else {
		return fileDate.toLocaleDateString();
	}
}

/**
 * Sort files by various criteria
 */
export function sortFiles<T extends {name: string; size?: number; createdAt?: string | Date; isDirectory?: boolean}>(
	files: T[],
	sortBy: 'name' | 'size' | 'date' | 'type' = 'name',
	sortOrder: 'asc' | 'desc' = 'asc'
): T[] {
	return [...files].sort((a, b) => {
		// Always put directories first
		if (a.isDirectory && !b.isDirectory) return -1;
		if (!a.isDirectory && b.isDirectory) return 1;
		
		let comparison = 0;
		
		switch (sortBy) {
			case 'name':
				comparison = a.name.localeCompare(b.name);
				break;
			case 'size':
				comparison = (a.size || 0) - (b.size || 0);
				break;
			case 'date':
				const dateA = new Date(a.createdAt || 0).getTime();
				const dateB = new Date(b.createdAt || 0).getTime();
				comparison = dateA - dateB;
				break;
			case 'type':
				const extA = getFileExtension(a.name);
				const extB = getFileExtension(b.name);
				comparison = extA.localeCompare(extB);
				break;
		}
		
		return sortOrder === 'asc' ? comparison : -comparison;
	});
}

/**
 * Filter files by search query
 */
export function filterFiles<T extends {name: string}>(
	files: T[],
	searchQuery: string
): T[] {
	if (!searchQuery.trim()) return files;
	
	const query = searchQuery.toLowerCase();
	return files.filter(file => 
		file.name.toLowerCase().includes(query)
	);
}

/**
 * Get file mime type from extension
 */
export function getFileMimeType(filename: string): string {
	const extension = getFileExtension(filename);
	
	const mimeTypes: Record<string, string> = {
		// Images
		jpg: 'image/jpeg',
		jpeg: 'image/jpeg',
		png: 'image/png',
		gif: 'image/gif',
		webp: 'image/webp',
		svg: 'image/svg+xml',
		bmp: 'image/bmp',
		
		// Videos
		mp4: 'video/mp4',
		avi: 'video/x-msvideo',
		mov: 'video/quicktime',
		wmv: 'video/x-ms-wmv',
		flv: 'video/x-flv',
		webm: 'video/webm',
		mkv: 'video/x-matroska',
		
		// Audio
		mp3: 'audio/mpeg',
		wav: 'audio/wav',
		flac: 'audio/flac',
		aac: 'audio/aac',
		ogg: 'audio/ogg',
		m4a: 'audio/mp4',
		
		// Documents
		pdf: 'application/pdf',
		doc: 'application/msword',
		docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
		txt: 'text/plain',
		md: 'text/markdown',
		rtf: 'application/rtf',
		
		// Spreadsheets
		xls: 'application/vnd.ms-excel',
		xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		csv: 'text/csv',
		
		// Presentations
		ppt: 'application/vnd.ms-powerpoint',
		pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
		
		// Archives
		zip: 'application/zip',
		rar: 'application/x-rar-compressed',
		'7z': 'application/x-7z-compressed',
		tar: 'application/x-tar',
		gz: 'application/gzip',
		
		// Code
		js: 'application/javascript',
		ts: 'application/typescript',
		jsx: 'application/javascript',
		tsx: 'application/typescript',
		html: 'text/html',
		css: 'text/css',
		scss: 'text/x-scss',
		json: 'application/json',
		xml: 'application/xml',
		py: 'text/x-python',
		java: 'text/x-java-source',
		cpp: 'text/x-c++src',
		c: 'text/x-csrc',
		php: 'text/x-php',
		rb: 'text/x-ruby',
		go: 'text/x-go',
		rs: 'text/x-rust',
		swift: 'text/x-swift',
		kt: 'text/x-kotlin',
		dart: 'text/x-dart',
	};
	
	return mimeTypes[extension] || 'application/octet-stream';
}