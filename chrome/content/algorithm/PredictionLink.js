/* Copyright (c) 2011 Bluejay <https://github.com/zr2d2/Blue-Jay>
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the XXX License as published by the Free 
 * Sofeware Foundation.
 *
 * You should have received a copy of the XXX License along with this 
 * program. If not, please visit <http://www....>
 */
 
/* Name: PredictionLink
 * Description: The PredictionLink class is used to estimate the rating 
 * that will be given to another song (or category) based on an attribute 
 * of another song (or category)
 */
 
 function PredictionLink(passedVal1, passedVal2){
    //alert("constructing predictionLink\r\n");
	
	/* public function */
	this.initializeDecreasing = initializeDecreasing;
	this.initializeIncreasing = initializeIncreasing;
	this.update = update;
	this.guess = guess;
	
	
	//private variables
	var inputData = passedVal1;
	var outputData = passedVal2;
    //alert("constructing Scatterplot\r\n");
	var plot = new ScatterPlot();
    //alert("constructing DateTime\r\n");
	var latestUpdateTime = new DateTime();
	var numChanges = 0.0;
	
	//message("making prediction link part 1\r\n");
	// check whether this link is predicting something from its own past history
	if (inputData.getOwnerName().equalTo(outputData.getOwnerName())) {
	
	    //message("making prediction link part 2\r\n");
		// check whether this link is using the participation history
		if (inputData.isAParticipationMovingAverage()) {
    	    //message("making prediction link part 3\r\n");
			
			// If we get here then we're predicting the score of a Candidate based
			// on its past frequency. Usually, if something has happened a lot recently 
			// then it will be boring in the future
			//this.initializeDecreasing();
		} else {
			// If we get here then we're predicting the score of a Candidate based
			// on its current score. If we start with a small amount of suspicion that it will
			// be positively correlated then we may save the user lots of time
			// We use a small weight, though, so it's easy to overpower
		    this.initializeIncreasing();
		}
	}
	


	//public function
	function initializeDecreasing(){
	    //message("making prediction link part 4\r\n");
	
		var intensity = 1;
		var numPoints = 40;
		var i = 0;
		var score = 0.0;
		var duration = 0.0;
		
		for (i = 0; i < numPoints; i++){
    		
			/*duration = i*1500.0;
			intensity = 1.0/duration;
			score = Math.sqrt(duration) / 250.0;
			*/
			duration = i * 1500;
			intensity = 1 / duration;
			score = i / numPoints;
			
			// add some extra variation to show that we aren't sure about this
			if (i % 2 == 0)
			    score = (1 + score) / 2;
			else
			    score = score / 2;
			plot.addDataPoint(new Datapoint(intensity, score, 1));
		}
		numChanges = numChanges + numPoints;
	}
	
	function initializeIncreasing(){
	    plot.addDataPoint(new Datapoint(0, 0, 1));
	    plot.addDataPoint(new Datapoint(1, 1, 1));
	    numChanges += 2;
	}
	
	// updates the scatterplot with any new data that it hadn't yet 
	// requested from the MovingAverage that it tries to estimate
	function update(){

        //alert("PredictionLink::update\r\n");
		var newPoints = inputData.getCorrelationsFor(outputData, latestUpdateTime);
        //alert("back in PredictionLink::update\r\n");
		
		if (newPoints[0].length > 0){
		
			var i=0;
            //alert("plot adding datapoints\r\n");
			for (i = 0; i < newPoints[0].length; i++) {
				plot.addDataPoint(newPoints[0][i]);
			}
		
			latestUpdateTime = outputData.getLatestDate();
			numChanges = numChanges + newPoints[1];
            //alert("plot done adding datapoints\r\n");
		}
	}
	
	// compute a distribution that represents the expected deviation from the overall mean
	function guess(when){
	
		//alert("PredictionLink::guess");
		
		var input = inputData.getCurrentValue(when, false);
		var middle = plot.predict(input.getMean());
		
		message("x ="+input.getMean());
		message("middle = " + middle.getMean());
		
		var leftOneStdDev = plot.predict(input.getMean() - input.getStdDev());
		message(" left = " + leftOneStdDev.getMean());
		
		var rightOneStdDev = plot.predict(input.getMean() + input.getStdDev());
		message(" right = " + rightOneStdDev.getMean());
		
		//alert("PredictionLink::guess pt2");
		
		var stdDevA = (rightOneStdDev.getMean() - leftOneStdDev.getMean()) / 2.0;
		var stdDevB = middle.getStdDev();
		var stdDev = Math.sqrt(stdDevA * stdDevA + stdDevB * stdDevB);

		//alert("PredictionLink::guess pt3");
		
		//var weight = numChanges - 1.0;
		var weight = numChanges;
		if (weight < 0.0){
			weight = 0.0;
		}
		var stdDev2;
		if (numChanges > 0)
		    stdDev2 = .5 / numChanges;
		else
    		stdDev2 = 0.5;
    				
		var result = new Distribution(middle.getMean(), stdDev + stdDev2, weight);
		//alert("PredictionLink::guess pt4");
		return result;
	}
}
		
	
	
	
	
	
	
	
	
	