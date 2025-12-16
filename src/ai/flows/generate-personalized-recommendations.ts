'use server';

/**
 * @fileOverview Generates personalized recommendations for students based on their progress and time played.
 *
 * - generatePersonalizedRecommendations - A function that generates personalized recommendations for a given student.
 * - PersonalizedRecommendationsInput - The input type for the generatePersonalizedRecommendations function.
 * - PersonalizedRecommendationsOutput - The return type for the generatePersonalizedRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedRecommendationsInputSchema = z.object({
  studentId: z.string().describe('The ID of the student.'),
  progress: z.number().describe("The student's overall progress in the Roblox experience (0-100)."),
  timePlayed: z.number().describe('The amount of time the student has played the Roblox experience, in minutes.'),
  experimentProgress: z.number().describe("The student's progress within the experiment (0-100)."),
  currentActivityScore: z.number().describe("The student's score on the activity (out of 28)."),
  experimentsCompleted: z.number().describe('Indicates if the student has completed the experiment (1 for yes, 0 for no).'),
  activitiesCompleted: z.number().describe('Indicates if the student has completed the activity (1 for yes, 0 for no).'),
});
export type PersonalizedRecommendationsInput = z.infer<typeof PersonalizedRecommendationsInputSchema>;

const PersonalizedRecommendationsOutputSchema = z.object({
  recommendations: z.array(z.string()).describe('A list of personalized recommendations for the student.'),
});
export type PersonalizedRecommendationsOutput = z.infer<typeof PersonalizedRecommendationsOutputSchema>;

export async function generatePersonalizedRecommendations(input: PersonalizedRecommendationsInput): Promise<PersonalizedRecommendationsOutput> {
  return generatePersonalizedRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedRecommendationsPrompt',
  input: {schema: PersonalizedRecommendationsInputSchema},
  output: {schema: PersonalizedRecommendationsOutputSchema},
  prompt: `You are an AI assistant for teachers using a Roblox educational experience.

You will generate personalized recommendations for a student based on their performance.

Student ID: {{{studentId}}}
Overall Progress: {{{progress}}}%
Time Played: {{{timePlayed}}} minutes
Experiment Progress: {{{experimentProgress}}}%
Activity Score: {{{currentActivityScore}}}/28
Experiment Completed: {{{experimentsCompleted}}} (1 means completed)
Activity Completed: {{{activitiesCompleted}}} (1 means completed)

Based on this data, provide 3 actionable recommendations for the student to improve their learning experience. Make each recommendation specific and concise, keeping in mind that this is for the teacher to give to the student. Focus on actionable steps to take next. If a student is doing well in one area but poorly in another, provide targeted advice.

Format your output as a JSON array of strings.`,
});

const generatePersonalizedRecommendationsFlow = ai.defineFlow(
  {
    name: 'generatePersonalizedRecommendationsFlow',
    inputSchema: PersonalizedRecommendationsInputSchema,
    outputSchema: PersonalizedRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
