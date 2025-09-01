<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>AI Music Guide</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
body { font-family: 'Inter', sans-serif; }

/* Note bounce animation */
@keyframes bounce {
    0%, 100% { transform: translateY(0px); }
    25% { transform: translateY(-8px); }
    50% { transform: translateY(-4px); }
    75% { transform: translateY(-6px); }
}

/* Bounce out animation */
@keyframes bounceOut {
    0% { transform: translateY(0px); }
    20% { transform: translateY(-15px); }
    40% { transform: translateY(-8px); }
    60% { transform: translateY(-12px); }
    80% { transform: translateY(-5px); }
    100% { transform: translateY(-20px) translateX(50px); opacity: 0; }
}

/* Staff styling */
.staff {
    position: absolute;
    top: 50%;
    left: 0;
    height: 50px;
    transform: translateY(-50%);
    background: repeating-linear-gradient(
        to bottom,
        black 0px,
        black 2px,
        transparent 2px,
        transparent 10px
    );
}

.bouncing {
    animation: bounce 0.6s ease-in-out infinite;
}

.bounce-out {
    animation: bounceOut 1s ease-in-out forwards;
}
</style>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center p-4">

<div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-3xl border-4 border-gray-300">
    <h1 class="text-4xl font-bold text-center mb-6 text-gray-800">
        AI Classical Music & Art Guide
    </h1>
    <p class="text-center text-gray-600 mb-8">
        Describe your mood, situation, or any other thought to get a classical music and art recommendation.
    </p>

    <!-- Input + Button -->
    <div class="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
        <input type="text" id="userInput" placeholder="e.g., I need to relax after a long day..."
               class="flex-grow w-full sm:w-auto p-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-blue-500 transition-colors">
        <button id="submitBtn"
                class="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-md hover:bg-blue-600 transition-colors cursor-pointer w-full sm:w-auto">
            Recommend
        </button>
    </div>

    <!-- Musical Staff with Note -->
    <div id="progressBarContainer" class="relative w-full h-12 mb-6">
        <span id="note" class="absolute text-5xl -translate-y-1/2 z-10" style="top:50%; left:0;">🎵</span>
        <div id="progressBar" class="staff w-0"></div>
    </div>

    <!-- Loading -->
    <div id="loading" class="hidden text-center text-gray-500 mb-6">
        <div class="animate-spin inline-block w-8 h-8 border-4 border-t-transparent border-blue-500 rounded-full"></div>
        <p class="mt-2">Thinking of the perfect piece...</p>
    </div>

    <!-- Recommendation -->
    <div id="resultContainer" class="hidden text-center">
        <div id="recommendationCard" class="bg-gray-50 p-6 rounded-lg shadow-inner text-left">
            <h2 id="resultHeading" class="text-2xl font-semibold mb-4 text-gray-700"></h2>
            <div class="space-y-6">

                <!-- Music Section -->
                <div class="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 class="text-xl font-semibold text-blue-700 mb-2">Music Recommendation</h3>
                    <div class="space-y-2 text-gray-700">
                        <div id="workInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Work:</strong> <span id="workName"></span>
                        </div>
                        <div id="composerInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Composer:</strong> <span id="composerName"></span>
                        </div>
                        <div id="movementsInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Movements:</strong> <span id="movementsText"></span>
                        </div>
                        <div id="historicalContext" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Historical Context:</strong> <span id="contextText"></span>
                        </div>
                        <div id="musicLinkInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Link:</strong> <span id="musicLinkSpan"></span>
                        </div>
                    </div>
                </div>

                <!-- Painting Section -->
                <div class="p-4 bg-orange-50 rounded-lg border border-orange-200">
                    <h3 class="text-xl font-semibold text-orange-700 mb-2">Painting Recommendation</h3>
                    <div class="space-y-2 text-gray-700">
                        <div class="flex justify-center mb-4">
                            <img id="paintingImage" src="" alt="Recommended Painting" class="max-w-full max-h-96 rounded-lg shadow-md object-contain">
                        </div>
                        <div id="paintingInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Painting:</strong> <span id="paintingName"></span>
                        </div>
                        <div id="artistInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Artist:</strong> <span id="artistName"></span>
                        </div>
                        <div id="paintingLinkInfo" class="p-3 bg-white rounded-lg border border-gray-200">
                            <strong class="text-lg">Link:</strong> <span id="paintingLinkSpan"></span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Error -->
    <div id="errorMessage" class="hidden text-center text-red-500 font-medium p-4 rounded-lg bg-red-100">
        No recommendation found for that phrase. Please try a different mood or keyword.
    </div>
</div>

<script>
    document.addEventListener('DOMContentLoaded', () => {
        const userInput = document.getElementById("userInput");
        const submitBtn = document.getElementById("submitBtn");
        const loading = document.getElementById("loading");
        const resultContainer = document.getElementById("resultContainer");
        const resultHeading = document.getElementById("resultHeading");
        const errorMessageDiv = document.getElementById("errorMessage");

        const progressBarContainer = document.getElementById("progressBarContainer");
        const note = document.getElementById("note");
        const progressBar = document.getElementById("progressBar");

        const workNameSpan = document.getElementById("workName");
        const composerNameSpan = document.getElementById("composerName");
        const movementsTextSpan = document.getElementById("movementsText");
        const contextTextSpan = document.getElementById("contextText");
        const musicLinkSpan = document.getElementById("musicLinkSpan");

        const paintingImage = document.getElementById("paintingImage");
        const paintingNameSpan = document.getElementById("paintingName");
        const artistNameSpan = document.getElementById("artistName");
        const paintingLinkSpan = document.getElementById("paintingLinkSpan");

        const moodsData = {
            calm: {
                music: {
                    work: "Clair de lune",
                    composer: "Claude Debussy",
                    movements: "The piece is a single movement from a larger suite. It is known for its quiet, melodic, and serene nature.",
                    historicalContext: "Composed in 1890, 'Clair de lune' is part of the 'Suite bergamasque.' It is a prime example of musical Impressionism, characterized by its focus on mood and atmosphere rather than structured forms. It evokes the soft, ethereal light of the moon.",
                    link: "https://www.youtube.com/watch?v=Fh-L0sB4-58"
                },
                painting: {
                    name: "Impression, Sunrise",
                    artist: "Claude Monet",
                    link: "https://en.wikipedia.org/wiki/Impression,_Sunrise",
                    image: "https://upload.wikimedia.org/wikipedia/commons/5/59/Claude_Monet%2C_Impression%2C_soleil_levant%2C_1872.jpg"
                }
            },
            romantic: {
                music: {
                    work: "Liebestraum No. 3",
                    composer: "Franz Liszt",
                    movements: "The piece is a solo piano nocturne, a single continuous movement.",
                    historicalContext: "Originally composed as a song, this piano piece from 1850 is a quintessential Romantic work. Its title translates to 'Dream of Love,' and it's known for its passionate and highly expressive melody, showcasing Liszt's virtuosity at the piano.",
                    link: "https://www.youtube.com/watch?v=KzE_t5iT3Qk"
                },
                painting: {
                    name: "The Kiss",
                    artist: "Gustav Klimt",
                    link: "https://en.wikipedia.org/wiki/The_Kiss_(Klimt)",
                    image: "https://upload.wikimedia.org/wikipedia/commons/4/40/The_Kiss_-_Gustav_Klimt_-_Google_Art_Project_2.jpg"
                }
            },
            joyful: {
                music: {
                    work: "The Four Seasons - 'Spring'",
                    composer: "Antonio Vivaldi",
                    movements: "Composed of three movements: I. Allegro, II. Largo e pianissimo, III. Allegro pastorale.",
                    historicalContext: "Part of a set of four violin concertos published in 1725, 'Spring' is a famous example of Baroque program music. Each movement is accompanied by a sonnet, which Vivaldi wrote to guide the listener's imagination through the sounds of birds, murmuring streams, and a pastoral dance.",
                    link: "https://www.youtube.com/watch?v=N_8A25y0bXw"
                },
                painting: {
                    name: "The Swing",
                    artist: "Jean-Honoré Fragonard",
                    link: "https://en.wikipedia.org/wiki/The_Swing_(Fragonard)",
                    image: "https://upload.wikimedia.org/wikipedia/commons/e/ea/Fragonard%2C_The_Swing.jpg"
                }
            },
            sad: {
                music: {
                    work: "Adagio for Strings",
                    composer: "Samuel Barber",
                    movements: "The piece is a single, slow movement.",
                    historicalContext: "This piece, composed in 1936, is one of the most popular and recognizable works of 20th-century classical music. It is known for its profound sense of melancholy and emotional power, and has been used to commemorate moments of national grief and tragedy, such as the funerals of Franklin D. Roosevelt and John F. Kennedy.",
                    link: "https://www.youtube.com/watch?v=Jm93cW2T9f8"
                },
                painting: {
                    name: "The Old Guitarist",
                    artist: "Pablo Picasso",
                    link: "https://en.wikipedia.org/wiki/The_Old_Guitarist",
                    image: "https://upload.wikimedia.org/wikipedia/en/2/26/Picasso_Old_Guitarist.jpg"
                }
            },
            energetic: {
                music: {
                    work: "Symphony No. 5",
                    composer: "Ludwig van Beethoven",
                    movements: "The first movement is Allegro con brio.",
                    historicalContext: "Composed between 1804 and 1808, Beethoven's Symphony No. 5 is one of the most famous works in the classical repertoire. Its iconic opening four-note motif has been interpreted as 'Fate knocking at the door' and symbolizes struggle and triumph. It stands as a powerful work of the Romantic era.",
                    link: "https://www.youtube.com/watch?v=jv2WJM-L6-0"
                },
                painting: {
                    name: "The Raft of the Medusa",
                    artist: "Théodore Géricault",
                    link: "https://en.wikipedia.org/wiki/The_Raft_of_the_Medusa",
                    image: "https://upload.wikimedia.org/wikipedia/commons/1/1d/Th%C3%A9odore_G%C3%A9ricault_-_The_Raft_of_the_Medusa_-_Google_Art_Project.jpg"
                }
            },
            epic: {
                music: {
                    work: "Carmina Burana",
                    composer: "Carl Orff",
                    movements: "A scenic cantata divided into five main parts, with the most famous being the opening and closing movement, 'O Fortuna.'",
                    historicalContext: "Written in 1935–36, 'Carmina Burana' is based on 24 poems from a medieval collection. Its raw, powerful rhythms and dramatic choruses give it a grand and epic scale, often used in film and media to signify a monumental or climactic event.",
                    link: "https://www.youtube.com/watch?v=Qx-q3GvH_90"
                },
                painting: {
                    name: "Napoleon Crossing the Alps",
                    artist: "Jacques-Louis David",
                    link: "https://en.wikipedia.org/wiki/Napoleon_Crossing_the_Alps",
                    image: "https://upload.wikimedia.org/wikipedia/commons/f/ff/Jacques-Louis_David_-_Napoleon_Crossing_the_Alps_-_Google_Art_Project_2.jpg"
                }
            },
            meditative: {
                music: {
                    work: "Gymnopédie No. 1",
                    composer: "Erik Satie",
                    movements: "A short, distinct piano piece that stands on its own as a single movement.",
                    historicalContext: "Composed in 1888, this piece is one of Satie's most famous works. It's known for its serene, minimalist style and gentle melodies, which were a stark contrast to the dramatic works of the Romantic period. It is often used to evoke a calm, introspective mood.",
                    link: "https://www.youtube.com/watch?v=0kS-e2yF0cE"
                },
                painting: {
                    name: "Wanderer Above the Sea of Fog",
                    artist: "Caspar David Friedrich",
                    link: "https://en.wikipedia.org/wiki/Wanderer_Above_the_Sea_of_Fog",
                    image: "https://upload.wikimedia.org/wikipedia/commons/b/b9/Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpg"
                }
            },
            dramatic: {
                music: {
                    work: "Ride of the Valkyries",
                    composer: "Richard Wagner",
                    movements: "An orchestral piece that serves as an interlude in the opera 'Die Walküre.'",
                    historicalContext: "Part of Wagner's epic opera cycle 'Der Ring des Nibelungen,' composed from 1854 to 1856. 'Ride of the Valkyries' is famous for its powerful, dynamic sound and has become synonymous with dramatic, intense moments in popular culture.",
                    link: "https://www.youtube.com/watch?v=XR480Qj5j5o"
                },
                painting: {
                    name: "Saturn Devouring His Son",
                    artist: "Francisco Goya",
                    link: "https://en.wikipedia.org/wiki/Saturn_Devouring_His_Son",
                    image: "https://upload.wikimedia.org/wikipedia/commons/8/87/Francisco_de_Goya%2C_Saturno_devorando_a_su_hijo_%281819-1823%29.jpg"
                }
            },
            suspenseful: {
                music: {
                    work: "Dies Irae",
                    composer: "Giuseppe Verdi",
                    movements: "A powerful chorus movement from the 'Requiem' mass.",
                    historicalContext: "Verdi’s 'Requiem' from 1874 is a dramatic and theatrical work often described as an opera in disguise. The 'Dies Irae' section, translating to 'Day of Wrath,' is a terrifying and intense musical depiction of the Last Judgment.",
                    link: "https://www.youtube.com/watch?v=Zd-Fv5eC-7c"
                },
                painting: {
                    name: "Judith Slaying Holofernes",
                    artist: "Artemisia Gentileschi",
                    link: "https://en.wikipedia.org/wiki/Judith_Slaying_Holofernes_(Artemisia_Gentileschi)",
                    image: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Artemisia_Gentileschi_-_Giuditta_che_decapita_Oloferne_-_Galleria_degli_Uffizi%2C_Florence.jpg"
                }
            },
            peaceful: {
                music: {
                    work: "Canon in D",
                    composer: "Johann Pachelbel",
                    movements: "A single piece known for its simple, repetitive structure and calming melody.",
                    historicalContext: "Composed around 1680, this piece is a masterpiece of the Baroque era. Its repetitive bass line and intertwining melodic lines create a sense of harmony and peace, making it a staple at weddings and for relaxation.",
                    link: "https://www.youtube.com/watch?v=rNby4hK96aY"
                },
                painting: {
                    name: "A Sunday on La Grande Jatte",
                    artist: "Georges Seurat",
                    link: "https://en.wikipedia.org/wiki/A_Sunday_on_La_Grande_Jatte",
                    image: "https://upload.wikimedia.org/wikipedia/commons/7/7d/Georges_Seurat_-_A_Sunday_on_La_Grande_Jatte_--_1884_-_Google_Art_Project.jpg"
                }
            }
        };

        const getMoodKeyword = async (userPrompt) => {
            const response = await fetch('/api/recommend', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mood: userPrompt })
            });

            if (response.status === 429) {
                const errorMessage = await response.text();
                throw new Error(errorMessage);
            }

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API response error: ${response.status} ${errorText}`);
            }

            const result = await response.json();
            const keyword = result?.keyword?.trim().toLowerCase();

            return keyword;
        };

        const updateUIWithRecommendation = (userText, recommendation) => {
            resultHeading.innerText = `Recommendation for "${userText}"`;
            
            // Music section
            workNameSpan.innerText = recommendation.music.work;
            composerNameSpan.innerText = recommendation.music.composer;
            movementsTextSpan.innerText = recommendation.music.movements;
            contextTextSpan.innerText = recommendation.music.historicalContext;
            musicLinkSpan.innerHTML = `<a href="${recommendation.music.link}" target="_blank" class="text-blue-500 hover:underline">View on Web</a>`;

            // Painting section
            paintingImage.src = recommendation.painting.image;
            paintingImage.alt = recommendation.painting.name;
            paintingNameSpan.innerText = recommendation.painting.name;
            artistNameSpan.innerText = recommendation.painting.artist;
            paintingLinkSpan.innerHTML = `<a href="${recommendation.painting.link}" target="_blank" class="text-blue-500 hover:underline">View on Web</a>`;

            // Reset image display on load
            paintingImage.onload = () => paintingImage.style.display = 'block';
            paintingImage.onerror = () => paintingImage.style.display = 'none';

            resultContainer.classList.remove('hidden');
        };

        const showLoading = () => {
            loading.classList.remove('hidden');
            progressBarContainer.classList.remove('hidden');
            note.style.left = '0px';
            note.classList.remove('bounce-out');
            note.classList.add('bouncing');
            progressBar.style.width = '0px';
        };

        const hideLoading = () => {
            loading.classList.add('hidden');
            progressBarContainer.classList.add('hidden');
            note.classList.remove('bouncing');
            note.classList.add('bounce-out');
        };

        submitBtn.addEventListener("click", async () => {
            const userText = userInput.value.trim();

            resultContainer.classList.add('hidden');
            errorMessageDiv.classList.add('hidden');
            
            if (userText.length === 0) {
                errorMessageDiv.innerText = "Please enter a descriptive phrase.";
                errorMessageDiv.classList.remove('hidden');
                return;
            }

            showLoading();

            const noteWidth = note.offsetWidth;
            const containerWidth = progressBarContainer.offsetWidth;
            let progress = 0;

            const interval = setInterval(() => {
                progress += 3;
                if (progress > 100) progress = 100;

                const notePosition = (progress / 100) * containerWidth;
                note.style.left = `${notePosition}px`;
                progressBar.style.width = `${notePosition}px`;
                
                if (progress === 100) {
                    clearInterval(interval);
                }
            }, 50);

            try {
                const moodKeyword = await getMoodKeyword(userText);
                const recommendation = moodsData[moodKeyword];
                
                if (recommendation) {
                    updateUIWithRecommendation(userText, recommendation);
                } else {
                    errorMessageDiv.innerText = "No recommendation found for that phrase. Please try a different mood or keyword.";
                    errorMessageDiv.classList.remove('hidden');
                }
            } catch (error) {
                console.error('Failed to get recommendation:', error);
                errorMessageDiv.innerText = error.message.includes('API response error: 429') 
                                           ? "Too many requests. Please try again in a minute." 
                                           : error.message.includes('Maximum daily limit')
                                           ? "Maximum daily limit has been reached. Please try again tomorrow."
                                           : "An error occurred while fetching a recommendation. Please try again.";
                errorMessageDiv.classList.remove('hidden');
            } finally {
                clearInterval(interval);
                hideLoading();
            }
        });
    });
</script>
</body>
</html>
