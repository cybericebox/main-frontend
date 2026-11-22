import {test} from "node:test"
import assert from "node:assert/strict"
import {payloadOfHtml, placeholdersInTextRows, rows} from "../scripts/rsc-placeholders.mjs"

// A Flight payload: a JSON row, a length-prefixed text row (byte length in hex) and a row after it.
function textRow(id: string, text: string) {
  return `${id}:T${Buffer.byteLength(text, "utf8").toString(16)},${text}`
}

test("rows: a text row ends after its byte length, not at a newline", () => {
  const payload = `0:["$","div",null,{}]\n${textRow("1", "line one\nрядок два")}2:"$1"\n`
  assert.deepEqual(rows(payload).map((r) => [r.id, r.tag, r.text]), [
    ["0", "", '["$","div",null,{}]'],
    ["1", "T", "line one\nрядок два"],
    ["2", "", '"$1"'],
  ])
})

test("rows: a length that runs past the payload is reported", () => {
  assert.throws(() => rows("1:Tfff,short"), /runs past the end/)
})

test("a placeholder in a text row is found; one in a JSON row is fine", () => {
  const payload = `0:{"href":"https://__NEXT_PUBLIC_DOMAIN__/"}\n${textRow("3e", `{"url":"https://__NEXT_PUBLIC_DOMAIN__/"}`)}`
  assert.deepEqual(placeholdersInTextRows(payload), [{id: "3e", placeholder: "__NEXT_PUBLIC_DOMAIN__"}])
  assert.deepEqual(placeholdersInTextRows(`0:{"x":"__NEXT_PUBLIC_DOMAIN__"}\n`), [])
})

test("substituting a placeholder in a text row breaks the row boundaries (React #412)", () => {
  const payload = `${textRow("1", "https://__NEXT_PUBLIC_DOMAIN__/")}2:"$1"\n`
  const substituted = payload.replaceAll("__NEXT_PUBLIC_DOMAIN__", "a.example")
  // the shorter value leaves the old length pointing past the end of the stream: React's "Connection closed"
  assert.throws(() => rows(substituted), /runs past the end/)
})

test("payloadOfHtml joins the pushes of an exported page", () => {
  const html = `<script>self.__next_f.push([0])</script><script>self.__next_f.push([1,"0:\\"a\\"\\n"])</script><script>self.__next_f.push([1,"1:T3,abc"])</script>`
  assert.equal(payloadOfHtml(html), '0:"a"\n1:T3,abc')
})
