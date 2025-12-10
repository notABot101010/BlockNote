import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { Awareness } from "y-protocols/awareness";
import { BlockNoteEditor } from "../../index.js";

/**
 * @vitest-environment jsdom
 */
describe("YUndo with collaboration", () => {
  it("can undo and redo with collaboration enabled", async () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("doc");
    const editor = BlockNoteEditor.create({
      collaboration: {
        fragment,
        user: { name: "Test User", color: "#ff0000" },
        provider: {
          awareness: new Awareness(doc),
        },
      },
      trailingBlock: false, // Disable trailing block for predictable test
    });

    const div = document.createElement("div");
    editor.mount(div);

    // Initial state: should have the initial block
    const initialDoc = editor.document;
    expect(initialDoc.length).toBeGreaterThanOrEqual(1);
    expect(initialDoc[0].type).toBe("paragraph");
    const initialContent = initialDoc[0].content;

    // Make a change by inserting text
    editor.insertBlocks(
      [
        {
          type: "paragraph",
          content: [{ text: "Hello", styles: {}, type: "text" }],
        },
      ],
      initialDoc[0].id,
      "after",
    );

    // Verify the change - there should now be 2 blocks
    let currentDoc = editor.document;
    expect(currentDoc.length).toBeGreaterThanOrEqual(2);
    expect(currentDoc[1].content).toEqual([
      { text: "Hello", styles: {}, type: "text" },
    ]);

    // Undo should work
    const undoResult = editor.undo();
    expect(undoResult).toBe(true);

    // Verify undo worked - should be back to initial state
    currentDoc = editor.document;
    expect(currentDoc.length).toBe(initialDoc.length);

    // Redo should work
    const redoResult = editor.redo();
    expect(redoResult).toBe(true);

    // Verify redo worked - should have the "Hello" block again
    currentDoc = editor.document;
    expect(currentDoc.length).toBeGreaterThanOrEqual(2);
    expect(currentDoc[1].content).toEqual([
      { text: "Hello", styles: {}, type: "text" },
    ]);
  });

  it("undo/redo commands exist and can be called", () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("doc");
    const editor = BlockNoteEditor.create({
      collaboration: {
        fragment,
        user: { name: "Test User", color: "#ff0000" },
        provider: {
          awareness: new Awareness(doc),
        },
      },
    });

    const div = document.createElement("div");
    editor.mount(div);

    // Verify methods exist
    expect(typeof editor.undo).toBe("function");
    expect(typeof editor.redo).toBe("function");

    // Calling undo/redo should not throw even when there's nothing to undo/redo
    expect(() => editor.undo()).not.toThrow();
    expect(() => editor.redo()).not.toThrow();
  });

  it("tracks changes and allows undo/redo", async () => {
    const doc = new Y.Doc();
    const fragment = doc.getXmlFragment("doc");
    const editor = BlockNoteEditor.create({
      collaboration: {
        fragment,
        user: { name: "Test User", color: "#ff0000" },
        provider: {
          awareness: new Awareness(doc),
        },
      },
      trailingBlock: false,
    });

    const div = document.createElement("div");
    editor.mount(div);

    const initialDoc = editor.document;
    const firstBlockId = initialDoc[0].id;
    const initialContent = initialDoc[0].content;

    // Make a change - update the first block
    editor.updateBlock(firstBlockId, {
      type: "paragraph",
      content: [{ text: "Modified", styles: {}, type: "text" }],
    });

    // Verify the change
    let currentDoc = editor.document;
    expect(currentDoc[0].content).toEqual([
      { text: "Modified", styles: {}, type: "text" },
    ]);

    // Undo should work and restore initial state
    const undoResult = editor.undo();
    expect(undoResult).toBe(true);
    currentDoc = editor.document;
    expect(currentDoc[0].content).toEqual(initialContent);

    // Redo should work and restore the modified state
    const redoResult = editor.redo();
    expect(redoResult).toBe(true);
    currentDoc = editor.document;
    expect(currentDoc[0].content).toEqual([
      { text: "Modified", styles: {}, type: "text" },
    ]);
  });
});
