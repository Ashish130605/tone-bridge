import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useRecorder } from "../../src/hooks/useRecorder";

// A minimal fake MediaRecorder: start() records, stop() emits one chunk then onstop.
class FakeMediaRecorder {
  constructor(stream) {
    this.stream = stream;
    this.state = "inactive";
    FakeMediaRecorder.last = this;
  }
  start() {
    this.state = "recording";
  }
  stop() {
    this.state = "inactive";
    this.ondataavailable?.({ data: new Blob(["chunk"], { type: "audio/wav" }) });
    this.onstop?.();
  }
}

const trackStop = vi.fn();
const getUserMedia = vi.fn();

beforeEach(() => {
  FakeMediaRecorder.last = null;
  trackStop.mockClear();
  getUserMedia.mockReset();
  getUserMedia.mockResolvedValue({ getTracks: () => [{ stop: trackStop }] });

  vi.stubGlobal("MediaRecorder", FakeMediaRecorder);
  Object.defineProperty(globalThis.navigator, "mediaDevices", {
    value: { getUserMedia },
    configurable: true,
    writable: true,
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRecorder", () => {
  it("starts inactive with no error", () => {
    const { result } = renderHook(() => useRecorder());
    expect(result.current.isRecording).toBe(false);
    expect(result.current.error).toBe("");
  });

  it("start() acquires the mic and begins recording", async () => {
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    expect(getUserMedia).toHaveBeenCalledWith({ audio: true });
    expect(FakeMediaRecorder.last.state).toBe("recording");
    expect(result.current.isRecording).toBe(true);
  });

  it("stop() resolves with the recorded Blob and releases the mic", async () => {
    const { result } = renderHook(() => useRecorder());
    await act(async () => {
      await result.current.start();
    });

    let blob;
    await act(async () => {
      blob = await result.current.stop();
    });

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.type).toBe("audio/wav");
    expect(blob.size).toBeGreaterThan(0);
    expect(trackStop).toHaveBeenCalled(); // mic tracks stopped
    expect(result.current.isRecording).toBe(false);
  });

  it("stop() resolves null when nothing is recording", async () => {
    const { result } = renderHook(() => useRecorder());
    let blob = "unset";
    await act(async () => {
      blob = await result.current.stop();
    });
    expect(blob).toBeNull();
  });

  it("sets an error when microphone access is denied", async () => {
    getUserMedia.mockRejectedValue(new Error("Permission denied"));
    const { result } = renderHook(() => useRecorder());

    await act(async () => {
      await result.current.start();
    });

    await waitFor(() => expect(result.current.error).toBe("Permission denied"));
    expect(result.current.isRecording).toBe(false);
  });
});
