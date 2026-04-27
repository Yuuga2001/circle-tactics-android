const mockSoundObject = {
  loadAsync: jest.fn().mockResolvedValue({}),
  playAsync: jest.fn().mockResolvedValue({}),
  stopAsync: jest.fn().mockResolvedValue({}),
  unloadAsync: jest.fn().mockResolvedValue({}),
  setIsLoopingAsync: jest.fn().mockResolvedValue({}),
  setVolumeAsync: jest.fn().mockResolvedValue({}),
  getStatusAsync: jest.fn().mockResolvedValue({ isLoaded: true, isPlaying: false }),
};

export default {
  Audio: {
    Sound: {
      createAsync: jest.fn().mockResolvedValue({ sound: mockSoundObject }),
    },
    setAudioModeAsync: jest.fn().mockResolvedValue({}),
  },
};
