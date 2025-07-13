'use client';

import {type JSX} from 'react';
import {ChevronLeft, ChevronRight, Zap} from 'lucide-react';
import {Step1Content} from './_components/step1-content.tsx';
import {Step2Voice} from './_components/step2-voice.tsx';
import {Step3Soundscape} from './_components/step3-soundscape.tsx';
import {Step4Advanced} from './_components/step4-advanced.tsx';
import {Step5Review} from './_components/step5-review.tsx';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';

export default function ASMRGenerationPage(): JSX.Element {
	const {currentStep, maxSteps, wizardSteps, isSubmitting, error, formData, nextStep, prevStep, goToStep} =
		useASMRStore();

	const currentStepData = wizardSteps.find((step) => step.id === currentStep);
	const progress = ((currentStep - 1) / (maxSteps - 1)) * 100;

	const renderStepContent = (): JSX.Element => {
		switch (currentStep) {
			case 1: {
				return <Step1Content />;
			}

			case 2: {
				return <Step2Voice />;
			}

			case 3: {
				return <Step3Soundscape />;
			}

			case 4: {
				return <Step4Advanced />;
			}

			case 5: {
				return <Step5Review />;
			}

			default: {
				return <Step1Content />;
			}
		}
	};

	const canGoNext = currentStep < maxSteps;
	const canGoPrevious = currentStep > 1;

	const getNextButtonText = (): string => {
		switch (currentStep) {
			case 1: {
				return '配置语音';
			}

			case 2: {
				return '选择音景';
			}

			case 3: {
				return '高级设置';
			}

			case 4: {
				return '预览确认';
			}

			case 5: {
				return '开始生成';
			}

			default: {
				return '下一步';
			}
		}
	};

	const isCurrentStepValid = (): boolean => {
		switch (currentStep) {
			case 1: {
				return Boolean(formData.text && formData.text.trim().length > 10);
			}

			case 2: {
				return Boolean(formData.voiceSettings?.voiceId);
			}

			case 3: {
				return Boolean(formData.soundscapeConfig?.prompt || formData.soundscapeConfig?.category);
			}

			case 4: {
				return true;
			} // 高级设置是可选的

			case 5: {
				return true;
			} // 预览页面

			default: {
				return false;
			}
		}
	};

	return (
		<>
			<Header>
				<h1 className="text-lg font-medium flex items-center gap-2">
					<Zap className="h-5 w-5 text-primary" />
					ASMR音频生成
				</h1>
			</Header>

			<Main>
				<div className="max-w-4xl mx-auto space-y-6">
					{/* Progress Indicator */}
					<Card>
						<CardContent className="pt-6">
							<div className="space-y-4">
								<div className="flex justify-between text-sm">
									<span>进度</span>
									<span>{Math.round(progress)}%</span>
								</div>
								<Progress value={progress} className="w-full" />

								{/* Step Indicators */}
								<div className="flex justify-between">
									{wizardSteps.map((step) => (
										<button
											key={step.id}
											className={`flex flex-col items-center space-y-1 text-xs transition-colors ${
												step.isActive
													? 'text-primary font-medium'
													: step.isCompleted
														? 'text-green-600'
														: 'text-muted-foreground hover:text-foreground'
											}`}
											disabled={isSubmitting}
											onClick={() => {
												goToStep(step.id);
											}}
										>
											<div
												className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
													step.isActive
														? 'bg-primary text-primary-foreground'
														: step.isCompleted
															? 'bg-green-100 text-green-600'
															: 'bg-muted'
												}`}
											>
												{step.isCompleted ? '✓' : step.id}
											</div>
											<span className="hidden sm:block">{step.title}</span>
										</button>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Error Display */}
					{error ? (
						<Card className="border-destructive">
							<CardContent className="pt-6">
								<div className="text-sm text-destructive">
									<strong>错误:</strong> {error}
								</div>
							</CardContent>
						</Card>
					) : null}

					{/* Current Step Content */}
					<Card>
						<CardHeader>
							<CardTitle>{currentStepData?.title}</CardTitle>
							<CardDescription>{currentStepData?.description}</CardDescription>
						</CardHeader>
						<CardContent>
							{renderStepContent()}
							{/* Navigation */}
							<div className="flex justify-between items-center mt-6">
								<div>
									{canGoPrevious ? (
										<Button
											variant="outline"
											disabled={isSubmitting}
											className="flex items-center gap-2"
											onClick={prevStep}
										>
											<ChevronLeft className="h-4 w-4" />
											上一步
										</Button>
									) : null}
								</div>
								<div>
									{canGoNext ? (
										<Button
											disabled={isSubmitting || !isCurrentStepValid()}
											size="lg"
											className="min-w-[120px] flex items-center gap-2"
											onClick={nextStep}
										>
											{getNextButtonText()}
											<ChevronRight className="h-4 w-4" />
										</Button>
									) : null}
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</Main>
		</>
	);
}
