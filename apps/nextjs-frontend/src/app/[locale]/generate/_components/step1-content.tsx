'use client';

import {type JSX} from 'react';
import {FileText, Lightbulb} from 'lucide-react';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {Button} from '@/components/ui/button';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';

export function Step1Content(): JSX.Element {
	const {formData, setText, completeStep, nextStep} = useASMRStore();

	const handleTextChange = (text: string) => {
		setText(text);
		// Auto-complete step when text is not empty
		if (text.trim().length > 10) {
			completeStep(1);
		}
	};

	const handleContinue = () => {
		if (formData.text && formData.text.trim().length > 10) {
			completeStep(1);
			nextStep();
		}
	};

	// 示例文本模板
	const exampleTexts = [
		{
			title: '睡前放松',
			content:
				'闭上眼睛，让身体完全放松下来。感受每一次呼吸带来的宁静，让思绪慢慢沉淀。今天的疲惫正在离你而去，取而代之的是深深的安宁。',
			category: '睡眠引导',
		},
		{
			title: '自然冥想',
			content:
				'想象自己置身于宁静的森林中，微风轻抚过树叶，发出沙沙的声响。鸟儿在远处轻声歌唱，溪水潺潺流淌。这里只有你和大自然的和谐共鸣。',
			category: '冥想引导',
		},
		{
			title: '正念练习',
			content:
				'将注意力集中在当下的感受。感受空气进入肺部的温度，感受身体与椅子接触的感觉。没有过去，没有未来，只有此刻的宁静和专注。',
			category: '正念练习',
		},
	];

	const textLength = formData.text?.length || 0;
	const isValidLength = textLength >= 10 && textLength <= 2000;

	return (
		<div className="space-y-6">
			{/* 主要输入区域 */}
			<div className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="content-text" className="text-base font-medium flex items-center gap-2">
						<FileText className="h-4 w-4" />
						输入您的文本内容
					</Label>
					<p className="text-sm text-muted-foreground">
						这段文本将被转换为舒缓的ASMR音频。建议使用平和、温柔的语言，适合放松和冥想。
					</p>
				</div>

				<div className="space-y-2">
					<Textarea
						id="content-text"
						placeholder="在这里输入您想要转换为ASMR音频的文本内容..."
						value={formData.text || ''}
						className="min-h-[200px] text-base leading-relaxed"
						maxLength={2000}
						onChange={(e) => {
							handleTextChange(e.target.value);
						}}
					/>
					<div className="flex justify-between items-center text-sm text-muted-foreground">
						<span>建议长度：100-800字符，适合3-5分钟的音频</span>
						<span className={textLength > 2000 ? 'text-destructive' : ''}>{textLength} / 2000</span>
					</div>
				</div>

				{/* 验证提示 */}
				{textLength > 0 && !isValidLength && (
					<div className="text-sm text-destructive">
						{textLength < 10 ? '文本内容至少需要10个字符' : '文本内容不能超过2000个字符'}
					</div>
				)}
			</div>

			{/* 示例模板 */}
			<Card>
				<CardHeader>
					<CardTitle className="text-lg flex items-center gap-2">
						<Lightbulb className="h-5 w-5 text-yellow-500" />
						内容模板
					</CardTitle>
					<CardDescription>选择一个模板快速开始，或者作为创作灵感</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1">
						{exampleTexts.map((example, index) => (
							<Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
								<CardContent className="p-4">
									<div className="space-y-3">
										<div className="flex items-center justify-between">
											<h4 className="font-medium">{example.title}</h4>
											<Badge variant="secondary" className="text-xs">
												{example.category}
											</Badge>
										</div>
										<p className="text-sm text-muted-foreground leading-relaxed">{example.content}</p>
										<Button
											variant="outline"
											size="sm"
											className="w-full"
											onClick={() => {
												handleTextChange(example.content);
											}}
										>
											使用此模板
										</Button>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				</CardContent>
			</Card>

			{/* 内容建议 */}
			<Card className="bg-blue-50 border-blue-200">
				<CardContent className="pt-6">
					<div className="space-y-2">
						<h4 className="font-medium text-blue-900">💡 创作建议</h4>
						<ul className="text-sm text-blue-800 space-y-1">
							<li>• 使用第二人称"您"来创造亲密感</li>
							<li>• 加入感官描述（触觉、听觉、视觉）</li>
							<li>• 保持语调平和、节奏缓慢</li>
							<li>• 避免激动人心或紧张的内容</li>
							<li>• 适合中老年人的语言风格和内容主题</li>
						</ul>
					</div>
				</CardContent>
			</Card>

			{/* 继续按钮 */}
			<div className="flex justify-end">
				<Button disabled={!isValidLength} size="lg" className="min-w-[120px]" onClick={handleContinue}>
					继续配置语音
				</Button>
			</div>
		</div>
	);
}
