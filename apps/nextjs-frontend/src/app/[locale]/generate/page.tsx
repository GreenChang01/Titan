'use client';

import {type JSX} from 'react';
import {ChevronLeft, ChevronRight, Zap} from 'lucide-react';
import {Step1Content} from './_components/step1-content.js';
import {Step2Voice} from './_components/step2-voice.js';
import {Step3Soundscape} from './_components/step3-soundscape.js';
import {Step4Advanced} from './_components/step4-advanced.js';
import {Step5Review} from './_components/step5-review.js';
import {useASMRStore} from '@/store/asmr/asmr.store';
import {Header} from '@/components/layout/header';
import {Main} from '@/components/layout/main';
import {
	Card, CardContent, CardDescription, CardHeader, CardTitle,
} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Progress} from '@/components/ui/progress';

// Wizard Step Components (to be created)

export default function ASMRGenerationPage(): JSX.Element {
	const {currentStep, maxSteps, wizardSteps, isSubmitting, error, nextStep, prevStep, goToStep} = useASMRStore();

	const currentStepData = wizardSteps.find(step => step.id === currentStep);
	const progress = ((currentStep - 1) / (maxSteps - 1)) * 100;

	const renderStepContent = (): JSX.Element => {
		switch (currentStep) {
			case 1: {
				return <Step1Content/>;
			}

			case 2: {
				return <Step2Voice/>;
			}

			case 3: {
				return <Step3Soundscape/>;
			}

			case 4: {
				return <Step4Advanced/>;
			}

			case 5: {
				return <Step5Review/>;
			}

			default: {
				return <Step1Content/>;
			}
		}
	};

	const canGoNext = currentStep < maxSteps;
	const canGoPrevious = currentStep > 1;

	return (
		<>
			<Header>
				<div className='flex items-center justify-between'>
					<div>
						<h1 className='text-lg font-medium flex items-center gap-2'>
							<Zap className='h-5 w-5 text-primary'/>
							ASMR音频生成
						</h1>
						<p className='text-sm text-muted-foreground'>
							{currentStepData?.description ?? '创建您的专属ASMR音频内容'}
						</p>
					</div>
					<div className='text-sm text-muted-foreground'>
						步骤 {currentStep} / {maxSteps}
					</div>
				</div>
			</Header>

			<Main>
				<div className='max-w-4xl mx-auto space-y-6'>
					{/* Progress Indicator */}
					<Card>
						<CardContent className='pt-6'>
							<div className='space-y-4'>
								<div className='flex justify-between text-sm'>
									<span>进度</span>
									<span>{Math.round(progress)}%</span>
								</div>
								<Progress value={progress} className='w-full'/>

								{/* Step Indicators */}
								<div className='flex justify-between'>
									{wizardSteps.map(step => (
										<button
											key={step.id}
											className={`flex flex-col items-center space-y-1 text-xs transition-colors ${
												step.isActive
													? 'text-primary font-medium'
													: (step.isCompleted
														? 'text-green-600'
														: 'text-muted-foreground hover:text-foreground')
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
														: (step.isCompleted
															? 'bg-green-100 text-green-600'
															: 'bg-muted')
												}`}
											>
												{step.isCompleted ? '✓' : step.id}
											</div>
											<span className='hidden sm:block'>{step.title}</span>
										</button>
									))}
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Error Display */}
					{error
						? (
							<Card className='border-destructive'>
								<CardContent className='pt-6'>
									<div className='text-sm text-destructive'>
										<strong>错误:</strong> {error}
									</div>
								</CardContent>
							</Card>
						)
						: null}

					{/* Current Step Content */}
					<Card>
						<CardHeader>
							<CardTitle>{currentStepData?.title}</CardTitle>
							<CardDescription>{currentStepData?.description}</CardDescription>
						</CardHeader>
						<CardContent>{renderStepContent()}</CardContent>
					</Card>

					{/* Navigation */}
					<div className='flex justify-between'>
						<Button
							variant='outline'
							disabled={!canGoPrevious || isSubmitting}
							className='flex items-center gap-2'
							onClick={prevStep}
						>
							<ChevronLeft className='h-4 w-4'/>
							上一步
						</Button>

						<Button disabled={!canGoNext || isSubmitting} className='flex items-center gap-2' onClick={nextStep}>
							{currentStep === maxSteps ? '开始生成' : '下一步'}
							<ChevronRight className='h-4 w-4'/>
						</Button>
					</div>
				</div>
			</Main>
		</>
	);
}
