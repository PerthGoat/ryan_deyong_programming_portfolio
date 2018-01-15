var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var program = "a3 21 60 00 61 00 62 08 d0 15 f2 1e 80 24 d0 15 f2 1e 80 24 d0 15 f2 1e 80 24 d0 15 f2 1e 80 24 d0 15 f2 1e 80 24 d0 15 f2 1e 80 24 d0 15 f2 1e 80 24 d0 15 66 05 67 02 6a 00 12 b8 6b 00 6c 00 a2 d8 fb 1e f3 65 22 ce 22 5c 12 62 22 ce 22 5c 7b 04 7c 01 5c 60 12 40 12 3c 12 00 a3 20 de d1 00 ee a2 d8 fb 1e f3 65 80 24 81 34 8e 00 8d 10 8e e6 8d d6 84 e0 65 c2 84 54 4f 01 12 92 4d 00 63 01 84 d0 65 e1 84 54 4f 01 12 92 33 02 73 01 12 94 22 9c a2 d8 fb 1e f3 55 12 4c a3 00 fa 1e f0 65 82 00 7a 01 64 1f 8a 42 60 20 61 1e 80 0e 81 1e c3 03 73 f8 00 ee 6b 00 6c 00 22 9c a2 d8 fb 1e f3 55 7b 04 7c 01 5c 60 12 bc 12 3c 8e 00 8d 10 8e e6 8d d6 00 ee 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00 f8 fa f9 fe fb fc fd ff 02 01 03 05 04 06 07 08 06 07 04 05 03 01 02 fe ff fc fb fd fa f9 f8 fa 80 f7 06 77 06 36 00 00 00 c7 6c cf 0c 0c 00 00 00 9f d9 df d9 d9 00 00 00 3f 8c 0c 8c 8c 00 00 00 67 6c 6c 6c 67 00 00 00 b0 30 30 30 be 00 00 00 f9 c3 f1 c0 fb 00 00 00 ef 00 ce 60 cc 00 00 00";

var bytes = program.split(" ");

var opcode = 0;
var memory = new Array(4096);
var V = new Array(16);
var I = 0;
var sp = 0;
var stack = new Array(16);
var pc = 0x200;

var delay_timer = 0;

for(var i = 0;i < memory.length;i++)
{
	memory[i] = 0;
}

for(var i = 0;i < V.length;i++)
{
	V[i] = 0;
}

for(var i = 0;i < stack.length;i++)
{
	stack[i] = 0;
}

//load the program into memory
for(var i = 0;i < bytes.length;i++)
{
	memory[i + 0x200] = parseInt(bytes[i], 16);
}

//clear off the screen
ctx.fillStyle = "#000000";
ctx.fillRect(0, 0, canvas.width, canvas.height);

function setPixel(x, y)
{
	var off = 0;
	var data = ctx.getImageData(x, y, 1, 1).data;
	//console.log(data);
	if(data[0] == 0)
	{
		off = 1;
		ctx.fillStyle = "#ffffff";
	}
	else
	{
		ctx.fillStyle = "#000000";
	}
	
	ctx.fillRect(x, y, 1, 1);
	
	return off;
}

function emulateCycle()
{
	opcode = memory[pc] << 8 | memory[pc + 1];
	
	var x = (opcode & 0x0F00) >> 8;
	var y = (opcode & 0x00F0) >> 4;
	
	pc += 2;
	
	switch(opcode & 0xF000)
	{
		case 0x0000:
			switch(opcode)
			{
				case 0x00E0:
					ctx.fillStyle = "#000000";
					ctx.fillRect(0, 0, canvas.width, canvas.height);
				break;
				
				case 0x00EE:
					pc = stack[--sp];
				break;
			}
		break;
		
		case 0xA000:
			I = opcode & 0x0FFF;
		break;
		
		case 0x6000:
			V[x] = opcode & 0x00FF;
		break;
		
		case 0xD000:
			V[0xF] = 0;
			
			var height = opcode & 0x000F;
			var registerX = V[x];
			var registerY = V[y];
			var line;
			
			for(var yline = 0;yline < height;yline++)
			{
				line = memory[I + yline];
				for(var xline = 0;xline < 8;xline++)
				{
					if((line & 0x80) > 0)
					{
						if(setPixel(registerX + xline, registerY + yline))
						{
							V[0xF] = 1;
						}
					}
					line <<= 1;
				}
			}
		break;
		
		case 0xF000:
			switch(opcode & 0x00FF)
			{
				case 0x1e:
					I += V[x];
				break;
				
				case 0x65:
					for(var i = 0;i <= x;i++)
					{
						V[i] = memory[I + i];
					}
				break;
				
				case 0x55:
					for(var i = 0;i <= x;i++)
					{
						memory[I + i] = V[i];
					}
				break;
				
				case 0x15:
					delay_timer = V[x];
				break;
				
				default:
					console.log("Undefined Opcode: " + opcode.toString(16));
				break;
			}
		break;
		
		case 0x8000:
			switch(opcode & 0x000F)
			{
				case 0x4:
					V[x] += V[y];
					
					V[0xF] = (V[x] > 255);
					if(V[x] > 255)
					{
						V[x] -= 256;
					}
				break;
				
				case 0x0:
					V[x] = V[y];
				break;
				
				case 0x2:
					V[x] &= V[y];
				break;
				
				case 0xE:
					V[0xF] = (V[x] & 0x80);
					V[x] <<= 1;
					if(V[x] > 255)
					{
						V[x] -= 256;
					}
				break;
				
				case 0x6:
					V[0xF] = V[x] & 0x1;
					V[x] >>= 1;
				break;
				
				default:
					console.log("Undefined Opcode: " + opcode.toString(16));
				break;
			}
		break;
		
		case 0x1000:
			pc = opcode & 0x0FFF;
		break;
		
		case 0x2000:
			stack[sp] = pc;
			sp++;
			pc = opcode & 0x0FFF;
		break;
		
		case 0x7000:
			V[x] += (opcode & 0x00FF);
			
			if(V[x] > 255)
			{
				V[x] -= 256;
			}
		break;
		
		case 0xC000:
			V[x] = Math.floor(Math.random() * 255) & (opcode & 0xFF);
		break;
		
		case 0x5000:
			if(V[x] == V[y])
			{
				pc += 2;
			}
		break;
		
		case 0x4000:
			if(V[x] != (opcode & 0x00FF))
			{
				pc += 2;
			}
		break;
		
		case 0x3000:
			if(V[x] == (opcode & 0x00FF))
			{
				pc += 2;
			}
		break;
		
		default:
			console.log("Undefined Opcode: " + opcode.toString(16));
		break;
	}
	
	if(delay_timer > 0)
	{
		delay_timer--;
	}
}
setInterval(emulateCycle, 1000 / 60);