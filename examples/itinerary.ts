import Instructor from "@instructor-ai/instructor"
import OpenAI from "openai"
import { z } from "zod"
import 'dotenv/config'

const AttractionsSchema = z.object({
    name: z.string().describe("The name of the attraction"),
    description: z.string().describe("A description of the attraction"),
    duration: z.number().describe("Duration of the visit in hours")
}).describe("An attraction to visit")

const ItinerariesSchema = z.object({
    place: z.string().describe("The place being visited"),
    duration: z.number().describe("Duration of the visit in days"),
    description: z.string().describe("A description of the place"),
    attractions: z.array(AttractionsSchema).min(1).describe("A list of attractions to visit"),
}).describe("An ordered list of places to visit")

const ItinerarySchema = z.object({
    slug: z.string().describe("A URL path slug that describes the itinerary"),
    totalDays: z.number().describe("Total number of days in the itinerary"),
    itineraries: z.array(ItinerariesSchema)
}).describe("An itinerary for a trip")

export const groq = new OpenAI({
    baseURL: "https://api.groq.com/openai/v1",
    apiKey: process.env["GROQ_API_KEY"]
})

const client = Instructor({
    client: groq,
    mode: "MD_JSON",
    // debug: true
})

const itinerary = await client.chat.completions.create({
    messages: [{ role: "user", content: "An itinerary for a week in Boston, USA" }],
    model: "llama3-70b-8192",
    response_model: { schema: ItinerarySchema, name: "Itinerary" },
    max_retries: 3
})

console.log(JSON.stringify(itinerary, null, 2))