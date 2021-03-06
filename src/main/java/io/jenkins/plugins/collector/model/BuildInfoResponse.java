package io.jenkins.plugins.collector.model;

import java.math.BigDecimal;
import java.util.List;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BuildInfoResponse {

  private BigDecimal failureRate;
  private Integer deploymentFrequency;
  private List<BuildInfo> buildInfos;
}
