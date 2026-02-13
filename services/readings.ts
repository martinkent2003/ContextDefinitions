import { supabase } from '../utils/supabase';
import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from "@supabase/supabase-js";

export async function postReading(title: string, content: string) {
    const { data, error } = await supabase
        .from('temp_readings')
        .insert({ title, content })
        .select();

    if (error) {
        throw error;
    }

    return data;
}

export async function uploadReading(content: string, title: string, genre: string, privacy: boolean) {
    const newReading = {
        title: title,
        genre: genre,
        language_code: "en",
        visibility: privacy ? "private" : "public",
        content: content,
    };

    const { data, error } = await supabase.functions.invoke('create-reading', {
    body: JSON.stringify(newReading)
    })
    if (error instanceof FunctionsHttpError) {
        const errorMessage = await error.context.json()
        console.log('Function returned an error', errorMessage)
    } else if (error instanceof FunctionsRelayError) {
        console.log('Relay error:', error.message)
    } else if (error instanceof FunctionsFetchError) {
        console.log('Fetch error:', error.message)
    } else {
        console.log(data)
    }
}

export async function insertSampleReadings() {
    const samples = [
        {
            title: 'Winnie The Pooh',
            content: `Here is Edward Bear, coming downstairs now, bump, bump, bump, on the back of his head, behind Christopher Robin. It is, as far as he knows, the only way of coming downstairs, but sometimes he feels that there really is another way, if only he could stop bumping for a moment and think of it. And then he feels that perhaps there isn't. Anyhow, here he is at the bottom, and ready to be introduced to you. Winnie-the-Pooh.

When I first heard his name, I said, just as you are going to say, "But I thought he was a boy?"

"So did I," said Christopher Robin.

"Then you can't call him Winnie?"

"I don't."

"But you said——"

"He's Winnie-ther-Pooh. Don't you know what 'ther' means?"

"Ah, yes, now I do," I said quickly; and I hope you do too, because it is all the explanation you are going to get.

Sometimes Winnie-the-Pooh likes a game of some sort when he comes downstairs, and sometimes he likes to sit quietly in front of the fire and listen to a story. This evening——

"What about a story?" said Christopher Robin.

"What about a story?" I said.

"Could you very sweetly tell Winnie-the-Pooh one?"

"I suppose I could," I said. "What sort of stories does he like?"

"About himself. Because he's that sort of Bear."

"Oh, I see."

"So could you very sweetly?"

"I'll try," I said.

So I tried.`,
        },
    ];

    const { data, error } = await supabase
        .from('temp_readings')
        .insert(samples)
        .select();

    if (error) {
        throw error;
    }

    return data;
}