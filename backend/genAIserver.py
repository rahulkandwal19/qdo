from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
import transformers
from transformers import AutoTokenizer, AutoModelForCausalLM
#-------------------------------------------------------------------------------
model_id = "meta-llama/Llama-3.2-1B"
pipe = transformers.pipeline(
    "text-generation", 
    model=model_id, 
    torch_dtype=torch.bfloat16, 
    device_map="cpu"
)
#--------------------------------------------------------------------------------
model_name = "Qwen/Qwen3-0.6B"

# load the tokenizer and the model
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.bfloat16,
    offload_folder="offload_dir",  # Offloads layers properly
    device_map="auto"
)

if hasattr(torch, "compile"):
    model = torch.compile(model, mode="reduce-overhead")

documents = [
    "Quantum computing uses qubits instead of classical bits.",
    "Superposition allows qubits to be in multiple states simultaneously.",
    "Quantum entanglement enables instant correlation between distant qubits."
]
#--------------------------------------------------------------------------------
app = Flask(__name__)
CORS(app)
#--------------------------------------------------------------------------------
@app.route("/generatel31b", methods=["GET","POST"])
def generate_res():
    text = request.args.get('question')
    print(text)
    x = pipe(text)
    print(x)
    return jsonify(x)
#--------------------------------------------------------------------------------

@app.route("/generate", methods=["GET"])
def generate_response():
    
    prompt = request.args.get("question")
    messages = [
        {"role": "system", "content": "You are Prof. QDo teaching quantum computing. Format response for plain text not markdown"},
        {"role": "user", "content": prompt}
    ]
    text = tokenizer.apply_chat_template(
        messages,
        tokenize=False,
        add_generation_prompt=True,
        enable_thinking=False 
    )
    model_inputs = tokenizer([text], return_tensors="pt").to(model.device)

    # conduct text completion
    generated_ids = model.generate(
        **model_inputs,
        max_new_tokens=256,
        temperature=0.7,
        use_cache=True 
    )
    output_ids = generated_ids[0][len(model_inputs.input_ids[0]):].tolist() 

    # parsing thinking content
    try:
        # rindex finding 151668 (</think>)
        index = len(output_ids) - output_ids[::-1].index(151668)
    except ValueError:
        index = 0

    content = tokenizer.decode(output_ids[index:], skip_special_tokens=True).strip("\n")
    print("content:", content)
    return jsonify({0:{"generated_text":content.replace('\n', '<br>')}})

@app.route('/check',methods = ["GET","POST"])
def checkServerIsOn():
    print("Got Request From : Client")
    return "Hello From QDo's genAI Chat Server !"
#--------------------------------------------------------------------------------
if __name__ == '__main__':
    app.run(port='80',threaded=True)