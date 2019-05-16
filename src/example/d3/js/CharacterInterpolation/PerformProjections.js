// from Font Project by Neill Campbell
// http://vecg.cs.ucl.ac.uk/Projects/projects_fonts/font_project/PerformPrediction.js
var CharFuncs = CharFuncs || {};

function size(A) { return numeric.dim(A); }

function computeK(x, X, alpha, gamma) {
	m = numeric.dim(x)[0];
	d = numeric.dim(x)[1];
	n = numeric.dim(X)[0];
	dd = numeric.dim(X)[1];

	if (d !== dd) { throw Error(); }

	xx = numeric.dot(numeric.mul(x,x),numeric.rep([d,1], 1));
	XX = numeric.dot(numeric.rep([1,d], 1), numeric.transpose(numeric.mul(X,X)));

	D1 = numeric.dot(xx, numeric.rep([1,n],1));
	D2 = numeric.dot(numeric.rep([m,1],1), XX);
	D3 = numeric.dot(numeric.mul(x, -2), numeric.transpose(X));

	DD = numeric.add(numeric.add(D1, D2), D3);

	K = numeric.mul(alpha, numeric.exp(numeric.mul(-0.5*gamma, DD)));

	return K;
}

function computeKArd(x, X, alpha, gamma) {
	m = numeric.dim(x)[0];
	d = numeric.dim(x)[1];
	n = numeric.dim(X)[0];
	dd = numeric.dim(X)[1];

	if (d !== dd) { throw Error(); }

	sqrtGamma = numeric.sqrt(numeric.transpose(gamma));

	X = numeric.mul(X, numeric.dot(numeric.rep([n,1], 1), sqrtGamma));

	xx = numeric.dot(numeric.mul(x,x),numeric.rep([d,1], 1));
	XX = numeric.dot(numeric.rep([1,d], 1), numeric.transpose(numeric.mul(X,X)));

	D1 = numeric.dot(xx, numeric.rep([1,n],1));
	D2 = numeric.dot(numeric.rep([m,1],1), XX);
	D3 = numeric.dot(numeric.mul(x, -2), numeric.transpose(X));

	DD = numeric.add(numeric.add(D1, D2), D3);

	K = numeric.mul(alpha, numeric.exp(numeric.mul(-0.5, DD)));

	return K;
}

function getK(x, data) {
  return computeKArd(x, data.X, data.alpha, data.gamma)
}

function performPrediction(x, data) {
	var K_xx_X

	if (data.gamma instanceof Array) {

		K_xx_X = computeKArd(x, data.X, data.alpha, data.gamma);

		yy_mean = numeric.dot(numeric.dot(data.Kinv, K_xx_X), data.Y);
	}
	else
	{
		console.log('RBF');

		K_xx_X = computeK(x, data.X, data.alpha, data.gamma);

		yy_mean = numeric.dot(numeric.dot(K_xx_X, data.Kinv), data.Y);
		
	}

	yy_mean = numeric.add(numeric.mul(yy_mean, data.Y_std), data.Y_mean);

	return numeric.transpose(yy_mean);
}

function performPredictionWithK(K_xx_X, data) {
  var y = numeric.dot(numeric.dot(data.Kinv, K_xx_X), data.Y)
	y = numeric.add(numeric.mul(y, data.Y_std), data.Y_mean);

	var yOffsetIdx = data.N * data.NumOutlines;

	ux = numeric.getBlock(data.Y_mean, [0,0], [0,yOffsetIdx-1]);
	uy = numeric.getBlock(data.Y_mean, [0,yOffsetIdx], [0,yOffsetIdx*2-1]);

	xMin = numeric.inf(ux);
	xMax = numeric.sup(ux);
	yMin = numeric.inf(uy);
	yMax = numeric.sup(uy);

	cx = 0.5 * (xMin + xMax);
	cy = 0.5 * (yMin + yMax);

	var S = {
		y: numeric.transpose(y),
		xMin: xMin,
		xMax: xMax,
		yMin: yMin,
		yMax: yMax,
		cx: cx,
		cy: cy,
	}

	return S;
}
function performPredictionWithBB(x, data) {
	var K_xx_X

	if (data.gamma instanceof Array) {

		K_xx_X = computeKArd(x, data.X, data.alpha, data.gamma);

		y = numeric.dot(numeric.dot(data.Kinv, K_xx_X), data.Y);
	}
	else
	{
		K_xx_X = computeK(x, data.X, data.alpha, data.gamma);

		y = numeric.dot(numeric.dot(K_xx_X, data.Kinv), data.Y);
	}
  y = numeric.add(numeric.mul(y, data.Y_std), data.Y_mean);

	var yOffsetIdx = data.N * data.NumOutlines;

	ux = numeric.getBlock(data.Y_mean, [0,0], [0,yOffsetIdx-1]);
	uy = numeric.getBlock(data.Y_mean, [0,yOffsetIdx], [0,yOffsetIdx*2-1]);

	xMin = numeric.inf(ux);
	xMax = numeric.sup(ux);
	yMin = numeric.inf(uy);
	yMax = numeric.sup(uy);

	cx = 0.5 * (xMin + xMax);
	cy = 0.5 * (yMin + yMax);

	var S = {
		y: numeric.transpose(y),
		xMin: xMin,
		xMax: xMax,
		yMin: yMin,
		yMax: yMax,
		cx: cx,
		cy: cy,
	}

	return S;

}