// @ts-nocheck

function getAudio(title: string): URL {
    const audioFile = searchAudioFiles(title)
    return parseAudioURL(audioFile.url)
}
